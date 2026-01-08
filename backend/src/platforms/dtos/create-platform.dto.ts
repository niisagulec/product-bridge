import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreatePlatformDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;
}

