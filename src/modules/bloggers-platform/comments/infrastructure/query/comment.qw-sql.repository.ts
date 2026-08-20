import { CommentViewModel } from '../../appllcation/queries/view-dto/comment.view-dto';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { LikeStatus } from 'src/modules/bloggers-platform/likes/domain/like.post.entity';
import { GetPostsQueryParams } from 'src/modules/bloggers-platform/posts/api/input-dto/get-posts-query-params.input-dto';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { commentsSortMap } from 'src/modules/bloggers-platform/posts/api/input-dto/post-sort.by';
import { SortDirection } from 'src/core/dto/base.query-params.input-dto';
import { LikesCommentRepository } from 'src/modules/bloggers-platform/likes/infrastructure/likes.comment.repository';
import { Comment } from '../../domain/comment.entity';

export class CommentsQwRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly likesRepository: LikesCommentRepository,
  ) {}

  async getCommentById(
    id: string,
    likeStatus: LikeStatus,
  ): Promise<CommentViewModel> {
    const comment = await this.commentRepository.findOne({
      where: { id },
    });

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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const sortby = commentsSortMap[query.sortBy];
    const sortDirection =
      query.sortDirection === SortDirection.Desc ? 'DESC' : 'ASC';

    const { pageNumber, pageSize } = query;

    //находим все комментарии, принадлежащие посту
    const [comments, totalCount] = await this.commentRepository
      .createQueryBuilder('c')
      .where(`c.postId = :postId`, { postId })
      .orderBy(`${sortby}`, sortDirection)
      .skip((pageNumber - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    if (!userId) {
      const items = comments.map((comment) =>
        CommentViewModel.mapToView(comment, LikeStatus.None),
      );

      console.log('COMMENT, COUNT', comments, totalCount);

      return PaginatedViewDto.mapToView({
        items,
        page: query.pageNumber,
        size: query.pageSize,
        totalCount,
      });
    }

    // Получаем массив id комментариев - потом по ним найдем лайки
    const commentIds = comments.map((c) => c.id);

    //здесь достаем лайки наших комменториев (со статусами)
    const likes = await this.likesRepository.findLikesForComments(
      userId,
      commentIds,
    );

    //создаем коллекцию айди коммент + статус лайк
    const likesMap = new Map<string, LikeStatus>();
    for (const like of likes) {
      likesMap.set(like.commentId, like.likeStatus);
    }

    //собираем вью модель
    const items = comments.map((comment) => {
      const myStatus = likesMap.get(comment.id) ?? LikeStatus.None;

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
