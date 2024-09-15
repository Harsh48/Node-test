import { IsString, IsNumber, IsEmail, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetAlertDto {
  @ApiProperty()
  @IsString()
  chain: string;

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiProperty({ enum: ['above', 'below'] })
  @IsString()
  @IsIn(['above', 'below'])
  direction: 'above' | 'below';

  @ApiProperty()
  @IsEmail()
  email: string;
}
