import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';
import { Trim } from 'src/core/decorators/trim';

export class EmailResendingInputDto {
  @ApiProperty()
  @IsString()
  @IsEmail()
  @Trim()
  email: string;
}
