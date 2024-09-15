import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PriceService } from './price.service';
import { PriceAlertService } from './price.alert.service';

@Injectable()
export class PriceCronService {
  constructor(
    private priceService: PriceService,
    private priceAlertService: PriceAlertService,
  ) {}

  @Cron('*/5 * * * *')
  async fetchPrices() {
    const ethereumPrice = await this.priceService.fetchAndSavePrice('ethereum');
    const polygonPrice = await this.priceService.fetchAndSavePrice('polygon');

    await this.priceAlertService.checkAndTriggerAlerts(
      'ethereum',
      ethereumPrice,
    );
    await this.priceAlertService.checkAndTriggerAlerts('polygon', polygonPrice);
  }

  @Cron('0 * * * *')
  async checkPriceAlerts() {
    await this.priceAlertService.checkAndSendAlerts();
  }
}
