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

export class CreateRegionDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  name: string;


}
