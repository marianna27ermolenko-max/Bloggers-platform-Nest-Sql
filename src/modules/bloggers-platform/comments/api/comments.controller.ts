import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommentViewModel } from '../appllcation/queries/view-dto/comment.view-dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetCommentQuery } from '../appllcation/queries/get-comments-query-handlers';
import { CommentInputDto } from './input-dto/comment.input-dto';
import { JwtOptionalAuthGuard } from 'src/modules/user-accounts/guard/bearer/jwt-optional-auth.guard';
import { ExtractUserFromRequest } from 'src/modules/user-accounts/guard/decorators/param/extract-user-from-request.decorator';
import { ExtractUserIfExistsFromRequest } from 'src/modules/user-accounts/guard/decorators/param/extract-user-if-exists-from-request.decorator';
import { UserContextDto } from 'src/modules/user-accounts/guard/dto/user-context.dto';
import { UpdateCommentCommand } from '../appllcation/usecases/update.comment.useCases';
import { LikeInputModel } from './input-dto/comment.like.status-input.dto';
import { UpdateCommentLikeStatusCommand } from '../appllcation/usecases/update.comment.like-status-useCases';
import { DeleteCommentCommand } from '../appllcation/usecases/delete.comment-useCases';
import { JwtAccessAuthGuard } from 'src/modules/user-accounts/guard/bearer/jwt.access-auth.guard';
@Controller('comments')
export class CommentsController {
  constructor(
    private queryBus: QueryBus,
    private commandBus: CommandBus,
  ) {}

  @Get(':id')
  @UseGuards(JwtOptionalAuthGuard)
  async getComment(
    @Param('id', new ParseIntPipe()) id: number,
    @ExtractUserIfExistsFromRequest() user: UserContextDto | null,
  ): Promise<CommentViewModel> {
    return this.queryBus.execute(new GetCommentQuery(id, user?.id || null));
  }

  @Put(':commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAccessAuthGuard)
  async updateComment(
    @Param('commentId', new ParseIntPipe()) commentId: number,
    @Body() body: CommentInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdateCommentCommand(commentId, user.id, body.content),
    );
  }

  @Put(':commentId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAccessAuthGuard)
  async updateLikeStatusByComment(
    @Param('commentId', new ParseIntPipe()) commentId: number,
    @Body() body: LikeInputModel,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdateCommentLikeStatusCommand(commentId, user.id, body.likeStatus),
    );
  }

  @Delete(':commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAccessAuthGuard)
  async deleteComment(
    @Param('commentId', new ParseIntPipe()) commentId: number,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<void> {
    await this.commandBus.execute(new DeleteCommentCommand(commentId, user.id));
  }
}
