




import { ANSWER, Prisma } from '@prisma/client';
import { IsEmail, IsNotEmpty, IsNumber, isNumber, IsNumberString, isNumberString, isString, IsString, Min, MinLength } from 'class-validator';


export class CreateTestItemDto {
    @IsNotEmpty()
    @IsString()
    question: string;

    number: number;

    @IsNotEmpty()
    @IsNumber()
    test_id: number;


    @IsNotEmpty()
    @IsString()
    answer: ANSWER;
    

    @IsNotEmpty()
    @IsString()
    answer_A: string;

    @IsNotEmpty()
    @IsString()
    answer_B: string;
    @IsNotEmpty()
    @IsString()
    answer_C: string;
    
    answer_D: string;

    answer_E: string;
    


}