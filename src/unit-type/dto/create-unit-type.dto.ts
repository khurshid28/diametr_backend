import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUnitTypeDto {
  @ApiProperty({ example: 'Kilogramm', description: 'O\'lchov birligi nomi' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({ example: 'kg', description: 'Qisqa belgi' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  symbol: string;
}
