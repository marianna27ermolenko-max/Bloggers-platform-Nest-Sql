import { IsEmail, IsString, Length } from 'class-validator';
import { Trim } from 'src/core/decorators/trim';

export class CreateUserInputDtoSql {
  @IsString()
  @Trim()
  @Length(3, 10)
  login: string;

  @IsString()
  @Trim()
  @IsEmail()
  email: string;

  @IsString()
  passwordHash: string;

  confirmationCode?: string | null;
  expirationDate?: Date | null;
}
