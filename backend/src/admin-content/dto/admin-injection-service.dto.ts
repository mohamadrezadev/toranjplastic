import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min, MinLength, ValidateNested } from 'class-validator';
import { AdminImageDto, AdminSpecificationDto } from './admin-image.dto.js';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class CreateInjectionServiceDto {
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  name!: string;

  @IsString()
  @Matches(SLUG_PATTERN, { message: 'اسلاگ فقط می‌تواند شامل حروف کوچک لاتین، عدد و خط تیره باشد.' })
  @MinLength(1)
  @MaxLength(160)
  slug!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  summary?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  description?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdminImageDto)
  images?: AdminImageDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdminSpecificationDto)
  specifications?: AdminSpecificationDto[];

  @IsOptional()
  @IsString()
  @MaxLength(80)
  ctaLabel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  ctaHref?: string;

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

export class UpdateInjectionServiceDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  name?: string;

  @IsOptional()
  @IsString()
  @Matches(SLUG_PATTERN, { message: 'اسلاگ فقط می‌تواند شامل حروف کوچک لاتین، عدد و خط تیره باشد.' })
  @MinLength(1)
  @MaxLength(160)
  slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  summary?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  description?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdminImageDto)
  images?: AdminImageDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdminSpecificationDto)
  specifications?: AdminSpecificationDto[];

  @IsOptional()
  @IsString()
  @MaxLength(80)
  ctaLabel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  ctaHref?: string;

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
