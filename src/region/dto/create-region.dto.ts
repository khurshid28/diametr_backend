import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateRegionDto {
  @ApiProperty({ example: 'Toshkent', description: 'Hudud nomi', minLength: 4 })
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  name: string;
}
