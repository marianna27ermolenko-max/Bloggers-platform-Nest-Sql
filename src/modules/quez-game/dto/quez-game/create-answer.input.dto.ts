import { IsString } from 'class-validator';
import { Trim } from 'src/core/decorators/trim';

export class AnswerInputModel {
  @IsString()
  @Trim()
  answer: string;
}
