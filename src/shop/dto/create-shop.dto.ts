import { Transform } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  isNumber,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
  Matches,
  Min,
  MinLength,
} from 'class-validator';
import { addHours, parse } from 'date-fns';

export class CreateShopDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  name: string;

  @Transform(({ value }) => addHours(parse(value, 'yyyy-MM-dd', new Date()), 5))
  @IsDate({
    message: 'expired has wrong format. format: yyyy-MM-dd (2025-08-01)',
  })
  @IsNotEmpty()
  expired: string;

  @IsOptional()
  @IsNumberString()
  @MinLength(8)
  inn: string;

  @IsNumber()
  lat: number;

  @IsNumber()
  lon: number;

  @IsOptional()
  @IsString()
  address: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  delivery_amount: number;

  

  
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  region_id: number;
}
