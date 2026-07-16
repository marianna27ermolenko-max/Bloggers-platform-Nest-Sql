import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { PostViewModel } from 'src/modules/bloggers-platform/posts/appllcation/queries/view-dto/post.view-dto';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { LikeStatus } from 'src/modules/bloggers-platform/likes/domain/like.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostDtoForViewModel } from '../../appllcation/queries/view-dto/post.dto.for.view.model';
import { CountResult } from 'src/modules/user-accounts/user/infrastructure/query/type/type.totalCount';
import {
  postsSortMap as postsByBlogSortMap,
  postsSortMap,
} from '../../api/input-dto/post-sort.by';
import { Injectable } from '@nestjs/common';
import { LikesRepository } from 'src/modules/bloggers-platform/likes/infrastructure/likes.repository';
import { NewestLikesDbModel } from './type/newest.likes.for.post.type';

@Injectable()
export class PostsQwSqlRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private readonly likesRepository: LikesRepository,
  ) {}

  async getAll(
    query: GetPostsQueryParams,
    userId: number | null,
  ): Promise<PaginatedViewDto<PostViewModel[]>> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    const sortDirection = query.sortDirection === 'desc' ? 'DESC' : 'ASC';

    const orderBy = postsSortMap[query.sortBy] ?? 'p.created_at';

    const posts: PostDtoForViewModel[] = await this.dataSource.query(
      `
         SELECT 
         p.id, 
         p.title, 
         p.short_description AS "shortDescription", 
         p.content, 
         p.likes_count AS "likesCount", 
         p.dislikes_count AS "dislikesCount", 
         p.created_at AS "createdAt", 
         p.blog_id AS "blogId", 
         b.name AS "blogName" 
      FROM posts AS p   
      JOIN blogs AS b 
      ON b.id = p.blog_id 
      ORDER BY ${orderBy} ${sortDirection}   
      LIMIT $1
      OFFSET $2
      `,
      [query.pageSize, query.calculateSkip()],
    );

    const count: CountResult[] = await this.dataSource.query(`
      SELECT COUNT (*) AS "totalCount" 
      FROM posts`);

    const totalCount = Number(count[0].totalCount);

    const postIds = posts.map((p) => p.id);

    const likes = userId
      ? await this.likesRepository.findLikesForPosts(userId, postIds)
      : [];

    const likesMap = new Map<number, LikeStatus>();
    for (const like of likes) {
      likesMap.set(like.postId, like.likeStatus);
    }

    //newest likes (ТОЛЬКО Like)
    const newestLikesDb =
      await this.likesRepository.findNewestLikesDbForPosts(postIds);
    const newestLikesMap = new Map<number, NewestLikesDbModel[]>();
    for (const like of newestLikesDb) {
      if (!newestLikesMap.has(like.postId)) {
        newestLikesMap.set(like.postId, []); //создали "корзину" для лайков поста
      }

      newestLikesMap.get(like.postId)!.push(like);
    }

    const items = posts.map((post) => {
      const id = post.id;
      const myStatus = likesMap.get(id) ?? LikeStatus.None;
      const newestLikes =
        newestLikesMap.get(post.id)?.map((like) => ({
          addedAt: like.addedAt,
          userId: like.userId,
          login: like.login,
        })) ?? [];
      return PostViewModel.mapToView(post, myStatus, newestLikes);
    });

    return PaginatedViewDto.mapToView({
      items,
      page: query.pageNumber,
      size: query.pageSize,
      totalCount,
    });
  }

  async getPostById(
    id: number,
    userId?: number | null,
  ): Promise<PostViewModel> {
    const post: PostDtoForViewModel[] = await this.dataSource.query(
      `
      SELECT 
         p.id, 
         p.title, 
         p.short_description AS "shortDescription", 
         p.content, 
         p.likes_count AS "likesCount", 
         p.dislikes_count AS "dislikesCount", 
         p.created_at AS "createdAt", 
         p.blog_id AS "blogId", 
         b.name AS "blogName" 
      FROM posts AS p   
      JOIN blogs AS b 
      ON b.id = p.blog_id 
      WHERE p.id =$1    
        `,
      [id],
    );

    const foundPost = post[0];
    if (!foundPost) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'post not found',
      });
    }

    //вычисляем статус
    let myStatus = LikeStatus.None;

    if (userId) {
      const like = await this.likesRepository.findLikeForPost(
        userId,
        foundPost.id,
      );

      myStatus = like?.likeStatus ?? LikeStatus.None;
    }

    const newestLikesDb =
      await this.likesRepository.findNewestLikesDbForPost(id);

    const newestLikes = newestLikesDb.map((l) => ({
      addedAt: l.addedAt,
      userId: l.userId,
      login: l.login ?? '',
    }));

    return PostViewModel.mapToView(foundPost, myStatus, newestLikes);
  }

  async getAllByBlogId(
    blogId: number,
    query: GetPostsQueryParams,
    userId: number | null,
  ): Promise<PaginatedViewDto<PostViewModel[]>> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    const sortDirection = query.sortDirection === 'desc' ? 'DESC' : 'ASC';

    const orderBy = postsByBlogSortMap[query.sortBy];

    const posts: PostDtoForViewModel[] = await this.dataSource.query(
      `
      SELECT 
         p.id, 
         p.title, 
         p.short_description AS "shortDescription", 
         p.content, 
         p.likes_count AS "likesCount", 
         p.dislikes_count AS "dislikesCount", 
         p.created_at AS "createdAt", 
         p.blog_id AS "blogId", 
         b.name AS "blogName" 
      FROM posts AS p   
      JOIN blogs AS b 
      ON b.id = p.blog_id 
      WHERE p.blog_id = $1 
      ORDER BY ${orderBy} ${sortDirection}   
      LIMIT $2
      OFFSET $3   
        `,
      [blogId, query.pageSize, query.calculateSkip()],
    );

    const postIds = posts.map((p) => p.id);
    //все лайки юзера к этим постам (массив)
    const myLikes = userId
      ? await this.likesRepository.findLikesForPosts(userId, postIds)
      : [];

    const likesMap = new Map<number, LikeStatus>();
    for (const like of myLikes) {
      likesMap.set(like.postId, like.likeStatus);
    }

    //newest likes (ТОЛЬКО Like)
    const newestLikesDb =
      await this.likesRepository.findNewestLikesDbForPosts(postIds);
    const newestLikesMap = new Map<number, NewestLikesDbModel[]>();
    for (const like of newestLikesDb) {
      if (!newestLikesMap.has(like.postId)) {
        newestLikesMap.set(like.postId, []); //создали "корзину" для лайков поста
      }

      newestLikesMap.get(like.postId)!.push(like);
    }

    const count: CountResult[] = await this.dataSource.query(
      `
      SELECT COUNT(*) AS "totalCount"
      FROM posts
      WHERE blog_id = $1`,
      [blogId],
    );

    const totalCount = Number(count[0].totalCount);

    const items: PostViewModel[] = posts.map((post) => {
      const postId = post.id;
      const myStatus = likesMap.get(postId) ?? LikeStatus.None;
      const newestLikes =
        newestLikesMap.get(post.id)?.map((like) => ({
          addedAt: like.addedAt,
          userId: like.userId,
          login: like.login,
        })) ?? [];

      return PostViewModel.mapToView(post, myStatus, newestLikes);
    });

    return PaginatedViewDto.mapToView({
      items,
      page: query.pageNumber,
      size: query.pageSize,
      totalCount,
    });
  }
}
