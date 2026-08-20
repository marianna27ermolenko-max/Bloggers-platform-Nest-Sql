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
import { BlogInputModel } from '../dto/create.blog-dto';
import { UpdateBlogDto } from '../dto/update.blog-dto';
import { PostViewModel } from '../../posts/appllcation/queries/view-dto/post.view-dto';
import { PostInputDtoByBlog } from './input-dto/post-ByBlog-input.dto';
import { ApiBasicAuth, ApiTags } from '@nestjs/swagger';
import { BasicAuthGuard } from 'src/modules/user-accounts/guard/basic/basic-auth.guard';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { BlogViewModelSql } from '../appllcation/queries/view-dto/blog.view-dto';
import { CreateBlogCommand } from '../appllcation/usecases/create.blog.usecases';
import { BlogsQwRepository } from '../infrastructure/query/blogs.query.sql-repository';
import { DeleteBlogCommand } from '../appllcation/usecases/delete.blog.usecases';
import { CreatePostByBlogIdCommand } from '../appllcation/usecases/create.post.by.blogId.usercase';
import { PostsQwRepository } from '../../posts/infrastructure/query/post.query.sql.repository';
import { GetBlogsQueryParams } from './input-dto/get-blogs-query-params.input-dto';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { GetBlogsQuery } from '../appllcation/queries/get-blogs.query-handler';
import { JwtOptionalAuthGuard } from 'src/modules/user-accounts/guard/bearer/jwt-optional-auth.guard';
import { ExtractUserIfExistsFromRequest } from 'src/modules/user-accounts/guard/decorators/param/extract-user-if-exists-from-request.decorator';
import { UserContextDto } from 'src/modules/user-accounts/guard/dto/user-context.dto';
import { GetPostsQueryParams } from '../../posts/api/input-dto/get-posts-query-params.input-dto';
import { GetPostsByBlogIdQuery } from '../appllcation/queries/get-post-by-blogId-query-handler';
import { UpdateBlogsCommand } from '../appllcation/usecases/update.blog.usecases';
import { DeletePostByBlogCommand } from '../appllcation/usecases/delete.post.by.blog';
import { UpdatePostByBlogInputDto } from '../appllcation/usecases/dto/update.post.byBlogModel';
import { UpdatePostByBlogCommand } from '../appllcation/usecases/update.post.by.blog';
import { Public } from 'src/modules/user-accounts/guard/decorators/public.decorator';

@Controller('sa/blogs')
@UseGuards(BasicAuthGuard)
@ApiBasicAuth('basicAuth')
@ApiTags('sa/blogs')
export class SaBlogsController {
  constructor(
    private queryBus: QueryBus,
    private commandBus: CommandBus,
    private postsQwRepository: PostsQwRepository,
    private blogsQwRepository: BlogsQwRepository,
  ) {
    console.log('BlogsController created');
  }

  @Get()
  async getAll(
    @Query() query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewModelSql[]>> {
    return this.queryBus.execute(new GetBlogsQuery(query));
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
  }

  @Post(':blogId/posts')
  @HttpCode(201)
  async createPostByBlogId(
    @Param('blogId') blogId: string,
    @Body() body: PostInputDtoByBlog,
  ): Promise<PostViewModel> {
    const postId = await this.commandBus.execute(
      new CreatePostByBlogIdCommand(
        blogId,
        body.title,
        body.shortDescription,
        body.content,
      ),
    );
    return this.postsQwRepository.getPostById(postId /* , null */);
  }

  @Post()
  @HttpCode(201)
  async createBlog(@Body() body: BlogInputModel): Promise<BlogViewModelSql> {
    const { name, description, websiteUrl } = body;
    const blogId = await this.commandBus.execute(
      new CreateBlogCommand(name, description, websiteUrl),
    );
    return this.blogsQwRepository.getByIdOrNotFoundFail(blogId);
  }

  @Put(':id')
  @HttpCode(204)
  async updateBlog(@Param('id') id: string, @Body() body: UpdateBlogDto) {
    await this.commandBus.execute(
      new UpdateBlogsCommand(id, body.name, body.description, body.websiteUrl),
    );
  }

  @Put(':blogId/posts/:postId')
  @HttpCode(204)
  async updatePostByBlog(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @Body() body: UpdatePostByBlogInputDto,
  ) {
    await this.commandBus.execute(
      new UpdatePostByBlogCommand(
        blogId,
        postId,
        body.title,
        body.shortDescription,
        body.content,
      ),
    );
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteBlog(@Param('id') id: string) {
    await this.commandBus.execute(new DeleteBlogCommand(id));
  }

  @Delete(':blogId/posts/:postId')
  @HttpCode(204)
  async deletePostByBlog(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
  ) {
    await this.commandBus.execute(new DeletePostByBlogCommand(blogId, postId));
  }
}
