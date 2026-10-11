import { IsString, MaxLength, MinLength } from 'class-validator';

export class PasswordLoginDto {
  @IsString() @MaxLength(32) mobile: string;
  @IsString() @MinLength(1) @MaxLength(128) password: string;
}
