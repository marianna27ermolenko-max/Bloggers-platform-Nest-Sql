import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GetBlogsQueryParams } from './input-dto/get-blogs-query-params.input-dto';
import { BlogsQwRepository } from '../infrastructure/query/blogs.query-repository';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { BlogViewModel } from '../appllcation/queries/view-dto/blog.view-dto';
import { BlogInputModel } from '../dto/create.blog-dto';
import { BlogsService } from '../appllcation/blog.service';
import { UpdateBlogDto } from '../dto/update.blog-dto';
import { PostsService } from '../../posts/appllcation/post.service';
import { PostViewModel } from '../../posts/appllcation/queries/view-dto/post.view-dto';
import { PostsQwRepository } from '../../posts/infrastructure/query/post.query.repository';
import { GetPostsQueryParams } from '../../posts/api/input-dto/get-posts-query-params.input-dto';
import { PostInputDtoByBlog } from './input-dto/post-ByBlog-input.dto';
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
  constructor(
    private queryBus: QueryBus,
    private blogsService: BlogsService,
    private postsQwRepository: PostsQwRepository,
    private postsService: PostsService,
    private blogsQwRepository: BlogsQwRepository,
  ) {
    console.log('BlogsController created');
  }

  @Public()
  @Get()
  async getAll(
    @Query() query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewModel[]>> {
    return this.queryBus.execute(new GetBlogsQuery(query));
    // return this.blogsQWRepository.getAll(query);
  }

  @Public()
  @ApiParam({ name: 'id', type: 'string' })
  @Get(':id')
  async getBlog(@Param('id') id: string): Promise<BlogViewModel> {
    return this.queryBus.execute(new GetBlogByIdQuery(id));
    // return this.blogsQWRepository.getByIdOrNotFoundFail(id);
  }

  @Public()
  @Get(':blogId/posts')
  @UseGuards(JwtOptionalAuthGuard)
  async getPostsByBlogId(
    @ExtractUserIfExistsFromRequest()
    user: UserContextDto | null,
    @Param('blogId') blogId: string,
    @Query() query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostViewModel[]>> {
    return this.queryBus.execute(
      new GetPostsByBlogIdQuery(blogId, user?.id || null, query),
    );

    // await this.blogsQwRepository.getByIdOrNotFoundFail(blogId);
    // return this.postsQwRepository.getAllByBlogId(blogId, query); //СЮДА ДОЛЖНЫ БУДЕМ ПЕРЕДАТЬ  И АЙДИ ЮЗЕРА
  }

  @Post(':blogId/posts')
  async createPostByBlogId(
    @Param('blogId') blogId: string,
    @Body() body: PostInputDtoByBlog,
  ): Promise<PostViewModel> {
    const postId = await this.postsService.createPostByBlogId(blogId, body);
    return this.postsQwRepository.getByIdOrNotFoundFail(postId, null);
  }

  @Post()
  async createBlog(@Body() body: BlogInputModel) {
    const blogId = await this.blogsService.createBlog(body);
    return this.blogsQwRepository.getByIdOrNotFoundFail(blogId);
  }

  @Put(':id')
  @HttpCode(204)
  async updateBlog(@Param('id') id: string, @Body() body: UpdateBlogDto) {
    await this.blogsService.updateBlog(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteBlog(@Param('id') id: string) {
    await this.blogsService.deleteBlog(id);
  }
}
