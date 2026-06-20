import { IsNotEmpty, IsString } from 'class-validator';
import { Trim } from 'src/core/decorators/trim';

export class ConfirmationDto {
  @IsString()
  @Trim()
  @IsNotEmpty()
  code: string;
}
