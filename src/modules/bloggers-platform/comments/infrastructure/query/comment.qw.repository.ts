import { InjectModel } from '@nestjs/mongoose';
import { type CommentModelType, Comment } from '../../domain/comment.entity';
import { CommentViewModel } from '../../appllcation/queries/view-dto/comment.view-dto';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import {
  LikeStatus,
  ParentType,
} from 'src/modules/bloggers-platform/likes/domain/like.entity';
import { GetPostsQueryParams } from 'src/modules/bloggers-platform/posts/api/input-dto/get-posts-query-params.input-dto';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { LikesRepository } from 'src/modules/bloggers-platform/likes/infrastructure/likes.repository';

export class CommentsQwRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    private readonly likesRepository: LikesRepository,
  ) {}

  async getComment(
    id: string,
    likeStatus: LikeStatus,
  ): Promise<CommentViewModel> {
    const comment = await this.CommentModel.findOne({ _id: id });
    if (!comment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'comment not found',
      });
    }

    return CommentViewModel.mapToView(comment, likeStatus);
  }

  async getCommentsByPostId(
    postId: string,
    query: GetPostsQueryParams,
    userId?: string | null,
  ): Promise<PaginatedViewDto<CommentViewModel[]>> {
    const filter = { postId };

    const totalCount = await this.CommentModel.countDocuments(filter);

    const comments = await this.CommentModel.find(filter)
      .sort({
        [query.sortBy]: query.sortDirection,
      })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    if (!userId) {
      const items = comments.map((comment) =>
        CommentViewModel.mapToView(comment, LikeStatus.None),
      );

      return PaginatedViewDto.mapToView({
        items,
        page: query.pageNumber,
        size: query.pageSize,
        totalCount,
      });
    }

    // Получаем dct id комментариев - потом по ним найдем лайки
    const commentIds = comments.map((c) => c._id.toString());

    const likes = await this.likesRepository.findLikesByParentIds(
      userId,
      commentIds,
      ParentType.Comment,
    );

    const likesMap = new Map<string, LikeStatus>();

    for (const like of likes) {
      likesMap.set(like.parentId.toString(), like.likeStatus);
    }

    //собираем вью модель
    const items = comments.map((comment) => {
      const myStatus = likesMap.get(comment._id.toString()) ?? LikeStatus.None;

      return CommentViewModel.mapToView(comment, myStatus);
    });

    return PaginatedViewDto.mapToView({
      items,
      page: query.pageNumber,
      size: query.pageSize,
      totalCount,
    });
  }
}
