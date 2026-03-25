import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateShopDto {
  @ApiProperty({
    example: 'Mega Market',
    description: 'Do’kon nomi',
    minLength: 4,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  name: string;

  @ApiPropertyOptional({
    example: 2,
    description: 'Bepul sinov muddati (oy, 0 = muddatsiz)',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  free_trial_months?: number;

  @ApiPropertyOptional({
    example: '123456789',
    description: 'INN',
    minLength: 8,
  })
  @IsOptional()
  @IsNumberString()
  @MinLength(8)
  inn: string;

  @ApiProperty({ example: 41.2995, description: 'Kenglik (latitude)' })
  @IsNumber()
  lat: number;

  @ApiProperty({ example: 69.2401, description: 'Uzunlik (longitude)' })
  @IsNumber()
  lon: number;

  @ApiPropertyOptional({
    example: 'Toshkent, Chilonzor tumani',
    description: 'Manzil',
  })
  @IsOptional()
  @IsString()
  address: string;

  @ApiPropertyOptional({
    example: 5000,
    description: 'Yetkazib berish narxi (so‘m)',
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  delivery_amount: number;

  @ApiProperty({ example: 1, description: 'Hudud ID', minimum: 1 })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  region_id: number;
}
