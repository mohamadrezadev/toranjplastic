import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { InquiryStatus, InquiryType } from '../../generated/prisma/enums.js';

export class AdminInquiryListQueryDto {
  @Type(() => Number) @IsInt() @Min(1) page = 1;
  @Type(() => Number) @IsInt() @Min(1) @Max(100) pageSize = 20;
  @IsOptional() @IsEnum(InquiryType) type?: InquiryType;
  @IsOptional() @IsEnum(InquiryStatus) status?: InquiryStatus;
  @IsOptional() @IsString() @MinLength(1) @MaxLength(191) assignedAdminId?: string;
  @IsOptional() @Transform(({ value }) => value === 'true' ? true : value === 'false' ? false : value) @IsBoolean() unassigned?: boolean;
  @IsOptional() @IsDateString({ strict: true }) from?: string;
  @IsOptional() @IsDateString({ strict: true }) to?: string;
  @IsOptional() @IsString() @MaxLength(80) q?: string;
}

export class UpdateInquiryStatusDto {
  @IsEnum(InquiryStatus) toStatus!: InquiryStatus;
  @IsInt() @Min(0) expectedVersion!: number;
}

export class UpdateInquiryAssignmentDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(191) assignedAdminId!: string | null;
  @IsInt() @Min(0) expectedVersion!: number;
}

export class AddInquiryNoteDto {
  @IsString() @MinLength(1) @MaxLength(4000) text!: string;
}

export class AddAdminInquiryMessageDto {
  @IsString() @MinLength(1) @MaxLength(4000) text!: string;
  @IsOptional() @IsBoolean() requestMoreInfo = false;
  @IsOptional() @IsInt() @Min(0) expectedVersion?: number;
}
