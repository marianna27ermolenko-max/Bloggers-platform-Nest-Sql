import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BaseQueryParams } from 'src/core/dto/base.query-params.input-dto';
import { PublishedStatus } from '../../dto/question/query.enum.dto';
import { Trim } from 'src/core/decorators/trim';

export enum QuestionSortBy {
  CreatedAt = 'createdAt',
  Body = 'body',
}

export class GetQuestionQueryParams extends BaseQueryParams {
  @ApiPropertyOptional({
    enum: PublishedStatus,
    default: PublishedStatus.all,
  })
  @IsEnum(PublishedStatus)
  publishedStatus: PublishedStatus = PublishedStatus.all;

  @ApiPropertyOptional()
  @IsOptional()
  @Trim()
  @IsString()
  bodySearchTerm?: string;

  @IsEnum(QuestionSortBy)
  @IsOptional()
  sortBy: QuestionSortBy = QuestionSortBy.CreatedAt;
}
