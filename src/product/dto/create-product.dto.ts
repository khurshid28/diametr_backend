import { PRODUCT_TYPE } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  isNotEmpty,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
  Min,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  name: string;

  @IsOptional()
  @IsString()
  desc: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  category_id: number;

  @IsNotEmpty()
  @IsEnum(PRODUCT_TYPE, {
    message: 'type can be COLOR,WEIGHT,LENGTH,SIZE,COUNTRY',
  })
  @IsOptional()
  @IsString()
  type: PRODUCT_TYPE;
}
