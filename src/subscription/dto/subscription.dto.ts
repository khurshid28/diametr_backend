import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class TopUpDto {
  @IsInt()
  @Min(1000)
  amount: number;

  @IsOptional()
  @IsString()
  note?: string;
}

export class UpdateSettingsDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  free_trial_months?: number;

  @IsOptional()
  @IsInt()
  @Min(1000)
  subscription_price?: number;
}

export class GiveFreeTrialDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  months?: number;
}
