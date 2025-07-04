import { IsEmail, IsNotEmpty, IsString, Min, MinLength } from 'class-validator';


export class LoginDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(13)
  login: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;
}