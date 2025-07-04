




import { IsEmail, IsNotEmpty, IsNumber, isNumber, IsNumberString, isNumberString, IsString, Min, MinLength } from 'class-validator';


export class CreateSectionDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsString()
    imgPath: string;

    @IsNotEmpty()
    @IsNumberString()
    book_id: string;
    

}
