import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PriceService } from './price.service';
import { Price } from './entities/price.entity';
import { SetAlertDto } from './dto/set-alert.dto';

@Controller('price')
@ApiTags('price')
export class PriceController {
  constructor(private readonly priceService: PriceService) {}

  @Get(':chain/last-day')
  @ApiOperation({ summary: 'Get prices for the last 24 hours' })
  @ApiResponse({
    status: 200,
    description: 'Returns an array of price data',
    type: [Price],
  })
  async getPricesLastDay(@Param('chain') chain: string): Promise<Price[]> {
    return this.priceService.getPricesLastDay(chain);
  }

  @Post('alert')
  @ApiOperation({ summary: 'Set price alert' })
  @ApiResponse({ status: 201, description: 'Alert has been set' })
  async setAlert(@Body() setAlertDto: SetAlertDto): Promise<void> {
    return this.priceService.setAlert(setAlertDto);
  }
}
