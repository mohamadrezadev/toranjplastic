import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

export enum StaffRoleDto {
  ADMIN = 'ADMIN',
  SALES = 'SALES',
  OPERATOR = 'OPERATOR',
}

export enum StaffStatusDto {
  ACTIVE = 'ACTIVE',
  DISABLED = 'DISABLED',
}

export enum StaffFilterStatusDto {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DISABLED = 'DISABLED',
}

export class StaffListQueryDto {
  @IsOptional() @IsEnum(StaffRoleDto) role?: StaffRoleDto;
  @IsOptional() @IsEnum(StaffFilterStatusDto) status?: StaffFilterStatusDto;
  @Type(() => Number) @IsInt() @Min(1) page = 1;
  @Type(() => Number) @IsInt() @Min(1) @Max(100) pageSize = 20;
}

export class StaffIdParamDto {
  @IsString() @MinLength(1) @MaxLength(64) id: string;
}

export class CreateStaffDto {
  @IsString() @MaxLength(32) mobile: string;
  @IsString() @MinLength(2) @MaxLength(80) displayName: string;
  @IsString() @MinLength(10) @MaxLength(128) password: string;
  @IsEnum(StaffRoleDto) role: StaffRoleDto;
}

export class UpdateStaffRoleDto {
  @IsEnum(StaffRoleDto) role: StaffRoleDto;
  @IsInt() @Min(0) expectedVersion: number;
}

export class UpdateStaffStatusDto {
  @IsEnum(StaffStatusDto) status: StaffStatusDto;
  @IsInt() @Min(0) expectedVersion: number;
}
