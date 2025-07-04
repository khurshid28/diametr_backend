






import { IsEmail, IsNotEmpty, IsNumber, isNumber, IsNumberString, isNumberString, IsString, Min, MinLength } from 'class-validator';


export class CreateTestDto {
    @IsNotEmpty()
    @IsString()
    name: string;


    @IsNotEmpty()
    @IsNumber()
    section_id: number;
    

}
