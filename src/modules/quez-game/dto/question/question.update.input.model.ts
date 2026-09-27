import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';
import { Trim } from 'src/core/decorators/trim';

export class QuestionUpdateInputModel {
  @ApiProperty()
  @Trim()
  @IsString()
  @Length(10, 500)
  @IsNotEmpty()
  body: string;

  @ApiProperty({ type: [String] })
  @Trim()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  correctAnswers: string[];
}
