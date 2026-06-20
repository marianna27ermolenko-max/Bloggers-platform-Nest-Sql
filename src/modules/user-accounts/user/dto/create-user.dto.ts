import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';
import { Trim } from 'src/core/decorators/trim';
import { loginConstraints, passwordConstraints } from '../domain/user.entity';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @Trim()
  @Length(loginConstraints.minLength, loginConstraints.maxLength)
  login: string;

  @ApiProperty()
  @IsString()
  @Trim()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @Trim()
  @Length(passwordConstraints.minLength, passwordConstraints.maxLength)
  password: string;
}

export class CreateUserDomainDto {
  @IsString()
  @Trim()
  @Length(loginConstraints.minLength, loginConstraints.maxLength)
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

export class UpdateUserDto {
  @ApiProperty()
  email: string;
}
