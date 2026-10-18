import { Transform, Type } from 'class-transformer';
import { IsEnum, IsIn, IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';
import { MediaAssetStatus } from '../../generated/prisma/enums.js';

export class AdminMediaQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  pageSize = 20;

  @IsOptional()
  @IsEnum(MediaAssetStatus)
  status?: MediaAssetStatus;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @Length(1, 100)
  search?: string;
}

export class MediaIdParamDto {
  @IsString()
  @Length(1, 64)
  id!: string;
}

export class UpdateMediaAltDto {
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @Length(1, 300)
  defaultAlt!: string;
}

export class MediaVariantParamDto extends MediaIdParamDto {
  @IsIn(['thumb', 'card', 'detail'])
  variant!: 'thumb' | 'card' | 'detail';
}

export class PreviewVariantQueryDto {
  @IsIn(['thumb', 'card', 'detail'])
  variant!: 'thumb' | 'card' | 'detail';
}
