import { BaseQueryParams } from 'src/core/dto/base.query-params.input-dto';
import { PostSortField } from './post-sort.by';
import { IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetPostsQueryParams extends BaseQueryParams {
  @ApiPropertyOptional({
    enum: PostSortField,
    default: PostSortField.CreatedAt,
  })
  @IsEnum(PostSortField)
  sortBy = PostSortField.CreatedAt;
}
