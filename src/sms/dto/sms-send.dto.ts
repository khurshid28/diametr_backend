import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
  Min,
  MinLength,
} from 'class-validator';

export class SmsSendDto {
  
  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber('UZ')
  @Length(13)
  phone: string;
}
