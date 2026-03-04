import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

export class SmsVerifyDto {
  @ApiProperty({ example: 'abc123', description: 'SMS yuborishda qaytarilgan ID' })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({ example: '1234', description: 'SMS orqali kelgan OTP kod', minLength: 4 })
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  code: string;
}
