import { IsString, Length } from 'class-validator';

export class SlugParamDto {
  @IsString()
  @Length(1, 160)
  slug!: string;
}
