import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PRODUCT_TYPE } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @ApiPropertyOptional({ example: 'G’isht', description: 'Mahsulot nomi' })
  @IsOptional()
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'G’isht', description: 'Nomi (uzbekcha)', minLength: 2 })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name_uz: string;

  @ApiPropertyOptional({ example: 'Кирпич', description: 'Nomi (ruscha)', minLength: 2 })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name_ru: string;

  @ApiPropertyOptional({ example: 'Qurilish g’ishti', description: 'Tavsif' })
  @IsOptional()
  @IsString()
  desc: string;

  @ApiProperty({ example: 1, description: 'Kategoriya ID', minimum: 1 })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  category_id: number;

  @ApiPropertyOptional({
    enum: PRODUCT_TYPE,
    example: PRODUCT_TYPE.COLOR,
    description: 'Tur: COLOR, WEIGHT, LENGTH, SIZE, COUNTRY, LITR',
  })
  @IsNotEmpty()
  @IsEnum(PRODUCT_TYPE, { message: 'type can be COLOR,WEIGHT,LENGTH,SIZE,COUNTRY,LITR' })
  @IsOptional()
  @IsString()
  type: PRODUCT_TYPE;
}
