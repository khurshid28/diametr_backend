import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductItemDto {
  @ApiProperty({ example: 'Qizil rang, 250g', description: 'Variant nomi' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Maxsus qadoqlash', description: 'Tavsif' })
  @IsOptional()
  @IsString()
  desc: string;

  @ApiProperty({ example: 1, description: 'Mahsulot ID', minimum: 1 })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  product_id: number;
}
