import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Price } from './entities/price.entity';
import { SetAlertDto } from './dto/set-alert.dto';
import { PriceAlert } from './entities/price-alert.entity';

@Injectable()
export class PriceService {
  constructor(
    @InjectRepository(Price)
    private priceRepository: Repository<Price>,
    
    @InjectRepository(PriceAlert)
    private priceAlertRepository: Repository<PriceAlert>,
    
    private configService: ConfigService,
  ) {}

  async fetchAndSavePrice(chain: string): Promise<number> {
    const apiKey = this.configService.get('moralis.apiKey');
    const url = `https://deep-index.moralis.io/api/v2/erc20/${this.getAddress(chain)}/price?chain=${chain}`;

    try {
      const response = await axios.get(url, {
        headers: { 'X-API-Key': apiKey },
      });

      const price = new Price();
      price.chain = chain;
      price.price = response.data.usdPrice;
      await this.priceRepository.save(price);
      return response.data.usdPrice;
    } catch (error) {
      throw new HttpException(
        'Failed to fetch price',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPricesLastDay(chain: string): Promise<Price[]> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return this.priceRepository.find({
      where: {
        chain,
        timestamp: MoreThanOrEqual(oneDayAgo),
      },
      order: { timestamp: 'DESC' },
    });
  }

  private getAddress(chain: string): string {
    switch (chain.toLowerCase()) {
      case 'ethereum':
        return '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'; // WETH address
      case 'polygon':
        return '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270'; // WMATIC address
      default:
        throw new HttpException('Unsupported chain', HttpStatus.BAD_REQUEST);
    }
  }

  async setAlert(setAlertDto: SetAlertDto): Promise<void> {
    const { chain, price, direction, email } = setAlertDto;

    // Validate input
    if (price <= 0) {
      throw new HttpException(
        'Price must be greater than 0',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!['above', 'below'].includes(direction)) {
      throw new HttpException(
        'Direction must be either "above" or "below"',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Create and save the alert
    const alert = new PriceAlert();
    alert.chain = chain;
    alert.price = price;
    alert.direction = direction;
    alert.email = email;
    alert.isTriggered = false;

    await this.priceAlertRepository.save(alert);
  }
}
