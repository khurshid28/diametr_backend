

import { IsEmail, IsNotEmpty, IsNumber, IsPhoneNumber, IsString, Length, Min, MinLength } from 'class-validator';


export class CreateAdminDto {

    @IsNotEmpty()
    @IsString()
    @MinLength(4)
    name: string;
  
    @IsNotEmpty()
    @IsString()
    @IsPhoneNumber("UZ")
    @Length(13)
    phone: string;


    
    password: string;


}
