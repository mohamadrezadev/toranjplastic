import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { InquiryStatus, InquiryType, MaterialCondition, MaterialRequestKind } from '../../generated/prisma/enums.js';

class OptionalCommonFieldsDto {
  @IsOptional() @IsString() @MaxLength(120) approximateQuantity?: string;
  @IsOptional() @IsString() @MaxLength(120) deliveryCity?: string;
  @IsOptional() @IsString() @MaxLength(160) requestedTiming?: string;
  @IsOptional() @IsString() @MaxLength(4000) description?: string;
}

export class CreateProductInquiryDto extends OptionalCommonFieldsDto {
  @IsString() @MinLength(1) @MaxLength(191) productId!: string;
}

export class CreateInjectionInquiryDto extends OptionalCommonFieldsDto {
  @IsString() @MinLength(1) @MaxLength(4000) partDescription!: string;
  @IsOptional() @IsString() @MaxLength(191) injectionServiceId?: string;
  @IsOptional() @IsString() @MaxLength(240) moldStatus?: string;
  @IsOptional() @IsString() @MaxLength(240) materialName?: string;
  @IsOptional() @IsString() @MaxLength(160) color?: string;
}

export class CreateMaterialInquiryDto extends OptionalCommonFieldsDto {
  @IsEnum(MaterialRequestKind) materialRequestKind!: MaterialRequestKind;
  @IsString() @MinLength(1) @MaxLength(240) polymerName!: string;
  @IsOptional() @IsString() @MaxLength(191) materialId?: string;
  @IsOptional() @IsString() @MaxLength(160) grade?: string;
  @IsOptional() @IsString() @MaxLength(160) brand?: string;
  @IsOptional() @IsEnum(MaterialCondition) materialCondition?: MaterialCondition;
  @IsOptional() @IsString() @MaxLength(80) quantityUnit?: string;
  @IsOptional() @IsString() @MaxLength(1000) application?: string;
  @IsOptional() @IsString() @MaxLength(2000) specifications?: string;
  @IsOptional() @IsString() @MaxLength(160) color?: string;
}

export class CreateContactInquiryDto {
  @IsString() @MinLength(1) @MaxLength(4000) description!: string;
}

export class InquiryListQueryDto {
  @Type(() => Number) @IsInt() @Min(1) page = 1;
  @Type(() => Number) @IsInt() @Min(1) @Max(50) pageSize = 12;
  @IsOptional() @IsEnum(InquiryType) type?: InquiryType;
  @IsOptional() @IsEnum(InquiryStatus) status?: InquiryStatus;
}

export class InquiryIdParamDto {
  @IsString() @MinLength(1) @MaxLength(191) id!: string;
}

export class AddCustomerInquiryMessageDto {
  @IsString() @MinLength(1) @MaxLength(4000) text!: string;
}
