import { CommentViewModel } from '../../appllcation/queries/view-dto/comment.view-dto';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { LikeStatus } from 'src/modules/bloggers-platform/likes/domain/like.entity';
import { GetPostsQueryParams } from 'src/modules/bloggers-platform/posts/api/input-dto/get-posts-query-params.input-dto';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { LikesRepository } from 'src/modules/bloggers-platform/likes/infrastructure/likes.repository';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CommentModelDBSql } from './type/comment.modelDB.sql';
import { CountResult } from 'src/modules/user-accounts/user/infrastructure/query/type/type.totalCount';
import { commentsSortMap } from 'src/modules/bloggers-platform/posts/api/input-dto/post-sort.by';
import { SortDirection } from 'src/core/dto/base.query-params.input-dto';

export class CommentsQwRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private readonly likesRepository: LikesRepository,
  ) {}

  async getCommentById(
    id: number,
    likeStatus: LikeStatus,
  ): Promise<CommentViewModel> {
    const comment: CommentModelDBSql[] = await this.dataSource.query(
      `SELECT 
      c.id, 
      c.post_id AS "postId",
      c.content, 
      c.user_id AS "userId", 
      c.created_at AS "createdAt",
      c.likes_count AS "likesCount",
      c.dislikes_count AS "dislikesCount", 
      u.login AS "userLogin"
      FROM comments AS c
      JOIN users AS u ON u.id = c.user_id
      WHERE c.id = $1
      `,
      [id],
    );

    const commentModel = comment[0];

    if (!commentModel) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'comment not found',
      });
    }

    return CommentViewModel.mapToView(commentModel, likeStatus);
  }

  async getCommentsByPostId(
    postId: number,
    query: GetPostsQueryParams,
    userId?: number | null,
  ): Promise<PaginatedViewDto<CommentViewModel[]>> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const sortby = commentsSortMap[query.sortBy];
    const sortDirection =
      query.sortDirection === SortDirection.Desc ? 'DESC' : 'ASC';

    //находим все комментарии, принадлежащие посту
    const comments: CommentModelDBSql[] = await this.dataSource.query(
      `
      SELECT 
      c.id, 
      c.content, 
      c.post_id AS "postId",
      c.user_id AS "userId", 
      c.created_at AS "createdAt",
      c.likes_count AS "likesCount",
      c.dislikes_count AS "dislikesCount", 
      u.login AS "userLogin"
      FROM comments AS c
      JOIN users AS u ON u.id = c.user_id
      WHERE c.post_id = $1
      ORDER BY ${sortby} ${sortDirection}
      LIMIT $2
      OFFSET $3
      `,
      [postId, query.pageSize, query.calculateSkip()],
    );

    //считаем кол-во комметрариев принадлежащих к посту
    const count: CountResult[] = await this.dataSource.query(
      `SELECT COUNT(*) AS "totalCount"
      FROM comments
      WHERE post_id = $1
      `,
      [postId],
    );

    const totalCount = Number(count[0].totalCount);

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

    // Получаем массив id комментариев - потом по ним найдем лайки
    const commentIds = comments.map((c) => c.id);

    //здесь достаем лайки наших комменториев (со статусами)
    const likes = await this.likesRepository.findLikesForComments(
      userId,
      commentIds,
    );

    //создаем коллекцию айди коммент + статус лайк
    const likesMap = new Map<number, LikeStatus>();
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
