import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { AdminImageDto } from './admin-image.dto.js';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class CreateCategoryDto {
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  name!: string;

  @IsString()
  @Matches(SLUG_PATTERN, {
    message: 'اسلاگ فقط می‌تواند شامل حروف کوچک لاتین، عدد و خط تیره باشد.',
  })
  @MinLength(1)
  @MaxLength(160)
  slug!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AdminImageDto)
  image?: AdminImageDto;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10_000)
  displayOrder?: number;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  metaTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(320)
  metaDescription?: string;
}

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  name?: string;

  @IsOptional()
  @IsString()
  @Matches(SLUG_PATTERN, {
    message: 'اسلاگ فقط می‌تواند شامل حروف کوچک لاتین، عدد و خط تیره باشد.',
  })
  @MinLength(1)
  @MaxLength(160)
  slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AdminImageDto)
  image?: AdminImageDto;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10_000)
  displayOrder?: number;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  metaTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(320)
  metaDescription?: string;
}
