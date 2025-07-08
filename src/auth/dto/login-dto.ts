import { IsEmail, IsNotEmpty, IsString, Min, MinLength } from 'class-validator';


export class LoginDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(12)
  login: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;
}