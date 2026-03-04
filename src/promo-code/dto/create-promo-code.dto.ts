import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CreatePromoCodeDto {
  @ApiProperty({ example: 'SUMMER25', description: 'Promo kod (katta harf, raqam, _ yoki -)' })
  @IsString()
  @IsNotEmpty()
  @Length(3, 50)
  @Matches(/^[A-Z0-9_-]+$/, {
    message: 'code must contain only uppercase letters, digits, _ or -',
  })
  code: string;

  @ApiProperty({
    example: 25,
    description: 'Chegirma foizi',
    enum: [15, 20, 25, 30, 40, 50],
  })
  @IsIn([15, 20, 25, 30, 40, 50], {
    message: 'discount must be one of: 15, 20, 25, 30, 40, 50',
  })
  discount: number;

  @ApiPropertyOptional({
    example: '2026-12-31T23:59:59Z',
    description: 'Tugash sanasi (ISO 8601). Qoldirsa — muddatsiz.',
  })
  @IsOptional()
  @IsISO8601()
  expires_at?: string;
}
