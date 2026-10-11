import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString() @MaxLength(32) mobile: string;
  @IsString() @MinLength(2) @MaxLength(80) displayName: string;
  @IsString() @MinLength(10) @MaxLength(128) password: string;
  @IsOptional() @IsEmail() @MaxLength(254) email?: string;
  @IsOptional() @IsString() @MaxLength(120) companyName?: string;
}
