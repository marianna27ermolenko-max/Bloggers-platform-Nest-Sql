import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GetPostsQueryParams } from './input-dto/get-posts-query-params.input-dto';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { PostViewModel } from '../appllcation/queries/view-dto/post.view-dto';
import { ApiBasicAuth, ApiTags } from '@nestjs/swagger';
import { BasicAuthGuard } from 'src/modules/user-accounts/guard/basic/basic-auth.guard';
import { Public } from 'src/modules/user-accounts/guard/decorators/public.decorator';
import { JwtOptionalAuthGuard } from 'src/modules/user-accounts/guard/bearer/jwt-optional-auth.guard';
import { ExtractUserFromRequest } from 'src/modules/user-accounts/guard/decorators/param/extract-user-from-request.decorator';
import { UserContextDto } from 'src/modules/user-accounts/guard/dto/user-context.dto';
import { LikeInputModel } from '../../comments/api/input-dto/comment.like.status-input.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UpdateLikeStatusForPostCommand } from '../appllcation/usecases/update-likeStatus-forPost-useCase';
import { CreateCommandByPostIdCommand } from '../appllcation/usecases/create.comment-byPostId- useCases';
import { CommentInputDto } from '../../comments/api/input-dto/comment.input-dto';
import { CommentViewModel } from '../../comments/appllcation/queries/view-dto/comment.view-dto';
import { ExtractUserIfExistsFromRequest } from 'src/modules/user-accounts/guard/decorators/param/extract-user-if-exists-from-request.decorator';
import { GetCommentByPostIdQuery } from '../appllcation/queries/get-comment-byPostId-query';
import { JwtAccessAuthGuard } from 'src/modules/user-accounts/guard/bearer/jwt.access-auth.guard';
import { GetPostByIdQuery } from '../appllcation/queries/get-post-by.id-query';
import { GetAllPostQuery } from '../appllcation/queries/get-all-post-query';

@Controller('posts')
@UseGuards(BasicAuthGuard)
@ApiBasicAuth('basicAuth')
@ApiTags('posts')
export class PostsController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Public()
  @UseGuards(JwtOptionalAuthGuard)
  @Get()
  async getAll(
    @Query() query: GetPostsQueryParams,
    @ExtractUserIfExistsFromRequest() user: UserContextDto | null,
  ): Promise<PaginatedViewDto<PostViewModel[]>> {
    return this.queryBus.execute(new GetAllPostQuery(query, user?.id || null));
  }

  @Public()
  @UseGuards(JwtOptionalAuthGuard)
  @Get(':id')
  async getPost(
    @Param('id', new ParseIntPipe()) id: number,
    @ExtractUserIfExistsFromRequest() user: UserContextDto | null,
  ): Promise<PostViewModel> {
    return this.queryBus.execute(new GetPostByIdQuery(id, user?.id || null));
  }

  @Get(':postId/comments')
  @Public()
  @UseGuards(JwtOptionalAuthGuard)
  async getComments(
    @Param('postId', new ParseIntPipe()) postId: number,
    @ExtractUserIfExistsFromRequest() user: UserContextDto | null,
    @Query() query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<CommentViewModel[]>> {
    return this.queryBus.execute(
      new GetCommentByPostIdQuery(postId, user?.id || null, query),
    );
  }

  @Post(':postId/comments')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAccessAuthGuard)
  async postCommentByPostId(
    @Param('postId', new ParseIntPipe()) postId: number,
    @Body() body: CommentInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<CommentViewModel> {
    return this.commandBus.execute(
      new CreateCommandByPostIdCommand(postId, user.id, body),
    );
  }

  @Put(':postId/like-status')
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAccessAuthGuard)
  async updateLikeStatusForPost(
    @Param('postId', new ParseIntPipe()) postId: number,
    @ExtractUserFromRequest() user: UserContextDto,
    @Body() body: LikeInputModel,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdateLikeStatusForPostCommand(postId, user.id, body.likeStatus),
    );
  }
}
