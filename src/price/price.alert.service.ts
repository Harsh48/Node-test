import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Price } from './entities/price.entity';
import { PriceAlert } from './entities/price-alert.entity';

@Injectable()
export class PriceAlertService {
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectRepository(Price)
    private priceRepository: Repository<Price>,
    @InjectRepository(PriceAlert)
    private priceAlertRepository: Repository<PriceAlert>,
    private configService: ConfigService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('email.host'),
      port: this.configService.get('email.port'),
      auth: {
        user: this.configService.get('email.user'),
        pass: this.configService.get('email.pass'),
      },
    });
  }

  private async sendPriceAlert(
    email: string,
    chain: string,
    alertPrice: number,
    currentPrice: number,
  ): Promise<void> {
    const mailOptions = {
      from: this.configService.get('email.user'),
      to: email,
      subject: `Price Alert: ${chain} has reached $${currentPrice}`,
      text: `The price of ${chain} has reached or exceeded your alert price of $${alertPrice}. The current price is $${currentPrice}.`,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Price alert email sent to ${email} for ${chain}`);
    } catch (error) {
      console.error(`Failed to send price alert email: ${error.message}`);
      throw error;
    }
  }

  async checkAndTriggerAlerts(
    chain: string,
    currentPrice: number,
  ): Promise<void> {
    const alerts = await this.priceAlertRepository.find({
      where: { chain, isTriggered: false },
    });

    for (const alert of alerts) {
      if (currentPrice >= alert.price) {
        await this.triggerAlert(alert, currentPrice);
      }
    }
  }

  private async triggerAlert(
    alert: PriceAlert,
    currentPrice: number,
  ): Promise<void> {
    try {
      await this.sendPriceAlert(
        alert.email,
        alert.chain,
        alert.price,
        currentPrice,
      );
      alert.isTriggered = true;
      await this.priceAlertRepository.save(alert);
      console.log(
        `Alert triggered for ${alert.chain} at $${currentPrice} for ${alert.email}`,
      );
    } catch (error) {
      console.error(`Failed to trigger alert: ${error.message}`);
    }
  }

  async checkAndSendAlerts(): Promise<void> {
    const chains = ['ethereum', 'polygon'];
    for (const chain of chains) {
      const currentPrice = await this.getCurrentPrice(chain);
      const oneHourAgoPrice = await this.getPriceOneHourAgo(chain);

      if (currentPrice && oneHourAgoPrice) {
        const priceIncrease =
          ((currentPrice.price - oneHourAgoPrice.price) /
            oneHourAgoPrice.price) *
          100;
        if (priceIncrease > 3) {
          await this.sendAlert(chain, priceIncrease);
        }
      }
    }
  }

  private async getCurrentPrice(chain: string): Promise<Price | undefined> {
    return this.priceRepository.findOne({
      where: { chain },
      order: { timestamp: 'DESC' },
    });
  }

  private async getPriceOneHourAgo(chain: string): Promise<Price | undefined> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return this.priceRepository.findOne({
      where: { chain, timestamp: oneHourAgo },
      order: { timestamp: 'DESC' },
    });
  }

  private async sendAlert(chain: string, priceIncrease: number): Promise<void> {
    const mailOptions = {
      from: this.configService.get('email.user'),
      to: 'hyperhire_assignment@hyperhire.in',
      subject: `Price Alert: ${chain} increased by ${priceIncrease.toFixed(2)}%`,
      text: `The price of ${chain} has increased by ${priceIncrease.toFixed(2)}% in the last hour.`,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
