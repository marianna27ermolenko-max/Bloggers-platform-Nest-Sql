import { BaseQueryParams } from 'src/core/dto/base.query-params.input-dto';
import { BlogSortBy } from './blogs-sort-by';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class GetBlogsQueryParams extends BaseQueryParams {
  @IsEnum(BlogSortBy)
  @IsOptional()
  sortBy = BlogSortBy.CreatedAt;

  @IsOptional()
  @IsString()
  searchNameTerm?: string;
}
