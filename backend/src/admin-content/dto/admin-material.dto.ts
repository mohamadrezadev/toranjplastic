import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min, MinLength, ValidateNested } from 'class-validator';
import { AdminImageDto, AdminSpecificationDto } from './admin-image.dto.js';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class CreateMaterialDto {
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
  @MaxLength(160)
  family?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  grade?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  manufacturer?: string;

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
  @IsBoolean()
  inquiryAvailable?: boolean;

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

export class UpdateMaterialDto {
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
  @MaxLength(160)
  family?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  grade?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  manufacturer?: string;

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
  @IsBoolean()
  inquiryAvailable?: boolean;

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
