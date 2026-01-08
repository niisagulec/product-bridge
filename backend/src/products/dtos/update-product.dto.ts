import { Transform, Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name?: string;

  // ProductType id
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  productType?: number;

  // Allow null to clear brand (service supports clearing when provided)
  @IsOptional()
  @Transform(({ value }) => {
    if (value === null || value === undefined || value === '') return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : value;
  })
  @IsInt()
  @Min(1)
  brandId?: number | null;
}

