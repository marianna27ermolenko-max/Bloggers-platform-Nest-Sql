import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';
import { passwordConstraints } from '../../../user/domain/user.entity';
import { Trim } from 'src/core/decorators/trim';

export class LoginInputDto {
  @ApiProperty()
  @IsString()
  @Trim()
  @Length(3, 100)
  loginOrEmail: string;

  @ApiProperty()
  @IsString()
  @Trim()
  @Length(passwordConstraints.minLength, passwordConstraints.maxLength)
  password: string;
}
