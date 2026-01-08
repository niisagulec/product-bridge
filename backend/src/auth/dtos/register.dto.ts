import { IsEmail, IsEnum, IsString, MinLength, Matches, IsOptional } from 'class-validator';
import { UserRole } from '../../users/user-role.enum';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).+$/, {
    message:
      'Password must include uppercase, lowercase, number, and symbol.',
  })
  password: string;
  
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
