import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GetBlogsQueryParams } from './input-dto/get-blogs-query-params.input-dto';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { BlogViewModelSql } from '../appllcation/queries/view-dto/blog.view-dto';
import { PostViewModel } from '../../posts/appllcation/queries/view-dto/post.view-dto';
import { GetPostsQueryParams } from '../../posts/api/input-dto/get-posts-query-params.input-dto';
import { ApiBasicAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtOptionalAuthGuard } from 'src/modules/user-accounts/guard/bearer/jwt-optional-auth.guard';
import { BasicAuthGuard } from 'src/modules/user-accounts/guard/basic/basic-auth.guard';
import { Public } from 'src/modules/user-accounts/guard/decorators/public.decorator';
import { QueryBus } from '@nestjs/cqrs';
import { GetBlogByIdQuery } from '../appllcation/queries/get-blog-by-id.query-handler';
import { GetBlogsQuery } from '../appllcation/queries/get-blogs.query-handler';
import { ExtractUserIfExistsFromRequest } from 'src/modules/user-accounts/guard/decorators/param/extract-user-if-exists-from-request.decorator';
import { UserContextDto } from 'src/modules/user-accounts/guard/dto/user-context.dto';
import { GetPostsByBlogIdQuery } from '../appllcation/queries/get-post-by-blogId-query-handler';

@Controller('blogs')
@UseGuards(BasicAuthGuard)
@ApiBasicAuth('basicAuth')
@ApiTags('blogs')
export class BlogsController {
  constructor(private queryBus: QueryBus) {
    console.log('BlogsController created');
  }

  @Public()
  @Get()
  async getAll(
    @Query() query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewModelSql[]>> {
    return this.queryBus.execute(new GetBlogsQuery(query));
  }

  @Public()
  @ApiParam({ name: 'id', type: 'string' })
  @Get(':id')
  async getBlog(
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<BlogViewModelSql> {
    return this.queryBus.execute(new GetBlogByIdQuery(id));
  }

  @Public()
  @Get(':blogId/posts')
  @UseGuards(JwtOptionalAuthGuard)
  async getPostsByBlogId(
    @ExtractUserIfExistsFromRequest()
    user: UserContextDto | null,
    @Param('blogId', new ParseIntPipe()) blogId: number,
    @Query() query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostViewModel[]>> {
    return this.queryBus.execute(
      new GetPostsByBlogIdQuery(blogId, user?.id || null, query),
    );
  }
}
