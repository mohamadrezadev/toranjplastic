import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { AdminManagedImageDto } from './admin-image.dto.js';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class CreateArticleDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsString()
  @Matches(SLUG_PATTERN, {
    message: 'اسلاگ فقط می‌تواند شامل حروف کوچک لاتین، عدد و خط تیره باشد.',
  })
  @MinLength(1)
  @MaxLength(160)
  slug!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  summary?: string;

  @IsString()
  @IsNotEmpty()
  body!: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AdminManagedImageDto)
  featuredImage?: AdminManagedImageDto;

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

export class UpdateArticleDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  expectedVersion?: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

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
  @MaxLength(500)
  summary?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  body?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AdminManagedImageDto)
  featuredImage?: AdminManagedImageDto | null;

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
