import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsISO8601,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

const moneyPattern = /^(0|[1-9]\d{0,18})$/;
const quantityPattern = /^(0|[1-9]\d{0,11})(?:\.\d{1,3})?$/;

export class QuotationItemInputDto {
  @IsString() @MinLength(1) @MaxLength(500) description: string;
  @IsString() @Matches(quantityPattern) quantity: string;
  @IsString() @MinLength(1) @MaxLength(40) unit: string;
  @IsString() @Matches(moneyPattern) unitPriceRials: string;
  @IsString() @Matches(moneyPattern) lineTotalRials: string;
}

export class QuotationDraftInputDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => QuotationItemInputDto)
  items: QuotationItemInputDto[];
  @IsString() @Matches(moneyPattern) subtotalRials: string;
  @IsString() @Matches(moneyPattern) discountRials: string;
  @IsString() @Matches(moneyPattern) taxRials: string;
  @IsString() @Matches(moneyPattern) additionalCostRials: string;
  @IsString() @Matches(moneyPattern) totalRials: string;
  @IsISO8601({ strict: true }) validUntil: string;
  @IsString() @MinLength(1) @MaxLength(2000) deliveryTerms: string;
  @IsString() @MinLength(1) @MaxLength(2000) paymentTerms: string;
  @IsOptional() @IsString() @MaxLength(4000) notes?: string;
}

export class UpdateQuotationDraftDto extends QuotationDraftInputDto {
  @IsInt() @Min(0) expectedVersion: number;
}

export class SendQuotationDto {
  @IsInt() @Min(0) expectedVersion: number;
  @IsInt() @Min(0) inquiryExpectedVersion: number;
}

export class ReviseQuotationDto {
  @IsInt() @Min(0) expectedVersion: number;
}

export class InquiryQuotationRouteDto {
  @IsString() @MinLength(1) @MaxLength(64) inquiryId: string;
}

export class QuotationRouteDto extends InquiryQuotationRouteDto {
  @IsString() @MinLength(1) @MaxLength(64) quotationId: string;
}

export class AcceptQuotationDto {
  @IsInt() @Min(1) quotationVersion: number;
  @IsInt() @Min(0) inquiryExpectedVersion: number;
}

export class RejectQuotationDto {
  @IsInt() @Min(1) quotationVersion: number;
  @IsInt() @Min(0) inquiryExpectedVersion: number;
  @IsOptional() @IsString() @MaxLength(2000) reason?: string;
}
