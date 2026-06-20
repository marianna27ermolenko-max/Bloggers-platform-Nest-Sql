import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Min } from 'class-validator';
import { Trim } from 'src/core/decorators/trim';
import { passwordConstraints } from '../../../user/domain/user.entity';

export class NewPasswordInputDto {
  @ApiProperty()
  @IsString()
  @Trim()
  @Length(passwordConstraints.minLength, passwordConstraints.maxLength)
  newPassword: string;

  @ApiProperty()
  @IsString()
  @Trim()
  @Min(1)
  recoveryCode: string;
}
