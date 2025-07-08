import { DATE_TYPE } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsEnum,
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

export class CreateWorkerDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  fullname: string;

  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber('UZ')
  @Length(13)
  phone: string;

  @IsOptional()
  password: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  service_id: number;

  @Transform(({ value }) => addHours(parse(value, 'yyyy-MM-dd', new Date()), 5))
  @IsDate({
    message: 'expired has wrong format. format: yyyy-MM-dd (2025-08-01)',
  })
  @IsNotEmpty()
  expired: string;

  @IsNumber()
  @Min(1000)
  @IsOptional()
  amount: number;

  @IsNotEmpty()
  @IsEnum(DATE_TYPE, {
    message: 'type can be ONCE,HOUR,DAY,MONTH',
  })
  @IsOptional()
  @IsString()
  date_type: DATE_TYPE;
}
