import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';
import { Trim } from 'src/core/decorators/trim';

export class UpdatePostByBlogInputDto {
  @ApiProperty()
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(1, 30)
  title: string;

  @ApiProperty()
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  shortDescription: string;

  @ApiProperty()
  @Trim()
  @IsNotEmpty()
  @IsString()
  @Length(1, 1000)
  content: string;
}
