// dto/reset-password.dto.ts
import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @MinLength(6)
  password: string;
}
