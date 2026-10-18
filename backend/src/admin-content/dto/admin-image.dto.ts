import {
  type ValidationArguments,
  type ValidationOptions,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  registerDecorator,
} from 'class-validator';

function IsValidImageSource(validationOptions?: ValidationOptions) {
  return (target: object, propertyName: string): void => {
    registerDecorator({
      name: 'isValidImageSource',
      target: target.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(_value: unknown, args: ValidationArguments): boolean {
          const image = args.object as AdminManagedImageDto;
          const hasUrl = image.url !== undefined;
          const hasMediaAssetId = image.mediaAssetId !== undefined;

          if (hasUrl === hasMediaAssetId) return false;
          if (hasMediaAssetId && (image.width !== undefined || image.height !== undefined)) {
            return false;
          }
          return true;
        },
      },
    });
  };
}

export class AdminImageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2048)
  url!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(240)
  alt!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10_000)
  width?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10_000)
  height?: number;
}

export class AdminManagedImageDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(2048)
  url?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  mediaAssetId?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(240)
  @IsValidImageSource({
    message:
      'تصویر باید دقیقاً یکی از url یا mediaAssetId را داشته باشد و ابعاد تصویر مدیریت‌شده قابل ارسال نیست.',
  })
  alt!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10_000)
  width?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10_000)
  height?: number;
}

export class AdminSpecificationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  label!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(240)
  value!: string;
}

export function isSafeContentImageUrl(value: string): boolean {
  if (value.startsWith('/') && !value.startsWith('//')) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}
