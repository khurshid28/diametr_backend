import { DELIVERY_TYPE } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
  Min,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { ProductItemDto } from './product-item-dto';

export class CreateOrderDto {
  @ValidateIf((o) => o.delivery_type !== DELIVERY_TYPE.MARKET)
  @IsNotEmpty()
  @IsNumber()
  lat: number;

  @ValidateIf((o) => o.delivery_type !== DELIVERY_TYPE.MARKET)
  @IsNotEmpty()
  @IsNumber()
  lon: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  shop_id: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1000)
  amount: number;

  @IsString()
  @IsNumber()
  @IsOptional()
  desc: number;

  @IsNotEmpty()
  @IsEnum(DELIVERY_TYPE, {
    message: 'delivery_type can be YANDEX,MARKET,FIXED',
  })
  @IsNotEmpty()
  @IsString()
  delivery_type: DELIVERY_TYPE;

  @ValidateNested({ each: true })
  @Type(() => ProductItemDto)
  @IsArray()
  @ArrayNotEmpty({ message: 'products cannot be empty' })
  @IsNotEmpty({ each: true })
  products: ProductItemDto[];
}
