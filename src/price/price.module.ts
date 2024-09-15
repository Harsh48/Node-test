import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceController } from './price.contoller';
import { PriceService } from './price.service';
import { PriceAlertService } from './price.alert.service';
import { PriceCronService } from './price.cron';
import { Price } from './entities/price.entity';
import { PriceAlert } from './entities/price-alert.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([Price, PriceAlert]), ConfigModule],
  controllers: [PriceController],
  providers: [PriceService, PriceAlertService, PriceCronService],
})
export class PriceModule {}
