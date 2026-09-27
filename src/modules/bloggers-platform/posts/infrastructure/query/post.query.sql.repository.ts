import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { PostViewModel } from 'src/modules/bloggers-platform/posts/appllcation/queries/view-dto/post.view-dto';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { LikeStatus } from 'src/modules/bloggers-platform/likes/domain/like.post.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  postsSortMap as postsByBlogSortMap,
  postsSortMap,
} from '../../api/input-dto/post-sort.by';
import { Injectable } from '@nestjs/common';
import { NewestLikesDbModel } from './type/newest.likes.for.post.type';
import { Post } from '../../domain/post.entity';
import { LikesPostRepository } from 'src/modules/bloggers-platform/likes/infrastructure/likes.post.repository';

@Injectable()
export class PostsQwRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Post) private postRepository: Repository<Post>,
    private readonly likesRepository: LikesPostRepository,
  ) {}

  async getAll(
    query: GetPostsQueryParams,
    userId: string | null,
  ): Promise<PaginatedViewDto<PostViewModel[]>> {
    const { pageNumber, pageSize } = query;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    const sortDirection = query.sortDirection === 'desc' ? 'DESC' : 'ASC';

    const orderBy = postsSortMap[query.sortBy] ?? 'createdAt';

    const [posts, totalCount] = await this.postRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.blog', 'b')
      .select([
        'p.id',
        'p.title',
        'p.shortDescription',
        'p.content',
        'p.likesCount',
        'p.dislikesCount',
        'p.blogId',
        'p.createdAt',
        'b.name',
      ])
      .orderBy(`${orderBy}`, sortDirection)
      .skip((pageNumber - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    console.log(posts, totalCount);

    const postIds = posts.map((p) => p.id);

    const likes = userId
      ? await this.likesRepository.findLikesForPosts(userId, postIds)
      : [];

    const likesMap = new Map<string, LikeStatus>();
    for (const like of likes) {
      likesMap.set(like.postId, like.likeStatus);
    }

    //newest likes (ТОЛЬКО Like)
    const newestLikesDb =
      await this.likesRepository.findNewestLikesDbForPosts(postIds);
    const newestLikesMap = new Map<string, NewestLikesDbModel[]>();
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
      return PostViewModel.mapToView(
        post,
        post.blog.name,
        myStatus,
        newestLikes,
      );
    });

    return PaginatedViewDto.mapToView({
      items,
      page: query.pageNumber,
      size: query.pageSize,
      totalCount,
    });
  }

  async getPostById(
    id: string,
    userId?: string | null,
  ): Promise<PostViewModel> {
    const post = await this.postRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.blog', 'b')
      .select([
        'p.id',
        'p.title',
        'p.shortDescription',
        'p.content',
        'p.likesCount',
        'p.dislikesCount',
        'p.blogId',
        'p.createdAt',
        'b.name',
      ])
      .where('p.id = :id', { id })
      .getOne();

    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'post not found',
      });
    }

    //вычисляем статус
    let myStatus = LikeStatus.None;

    if (userId) {
      const like = await this.likesRepository.findLike(userId, post.id);

      myStatus = like?.likeStatus ?? LikeStatus.None;
    }

    const newestLikesDb =
      await this.likesRepository.findNewestLikesDbForPost(id);

    const newestLikes = newestLikesDb.map((l) => ({
      addedAt: l.addedAt,
      userId: l.userId,
      login: l.login ?? '',
    }));

    return PostViewModel.mapToView(post, post.blog.name, myStatus, newestLikes);
  }

  async getAllByBlogId(
    blogId: string,
    query: GetPostsQueryParams,
    userId: string | null,
  ): Promise<PaginatedViewDto<PostViewModel[]>> {
    const { pageNumber, pageSize } = query;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    const sortDirection = query.sortDirection === 'desc' ? 'DESC' : 'ASC';

    const orderBy = postsByBlogSortMap[query.sortBy] ?? 'p.createdAt';

    const [posts, totalCount] = await this.postRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.blog', 'b')
      .select([
        'p.id',
        'p.title',
        'p.shortDescription',
        'p.content',
        'p.likesCount',
        'p.dislikesCount',
        'p.blogId',
        'p.createdAt',
        'b.name',
      ])
      .where('p.blogId = :blogId', { blogId })
      .orderBy(`${orderBy}`, sortDirection)
      .skip((pageNumber - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    const postIds = posts.map((p) => p.id);
    //все лайки юзера к этим постам (массив)
    const myLikes = userId
      ? await this.likesRepository.findLikesForPosts(userId, postIds)
      : [];

    const likesMap = new Map<string, LikeStatus>();
    for (const like of myLikes) {
      likesMap.set(like.postId, like.likeStatus);
    }

    //newest likes (ТОЛЬКО Like)
    const newestLikesDb =
      await this.likesRepository.findNewestLikesDbForPosts(postIds);
    const newestLikesMap = new Map<string, NewestLikesDbModel[]>();
    for (const like of newestLikesDb) {
      if (!newestLikesMap.has(like.postId)) {
        newestLikesMap.set(like.postId, []); //создали "корзину" для лайков поста
      }

      newestLikesMap.get(like.postId)!.push(like);
    }

    // const count: CountResult[] = await this.dataSource.query(
    //   `
    //   SELECT COUNT(*) AS "totalCount"
    //   FROM posts
    //   WHERE blog_id = $1`,
    //   [blogId],
    // );

    // const totalCount = Number(count[0].totalCount);

    const items: PostViewModel[] = posts.map((post) => {
      const postId = post.id;
      const myStatus = likesMap.get(postId) ?? LikeStatus.None;
      const newestLikes =
        newestLikesMap.get(post.id)?.map((like) => ({
          addedAt: like.addedAt,
          userId: like.userId,
          login: like.login,
        })) ?? [];

      return PostViewModel.mapToView(
        post,
        post.blog.name,
        myStatus,
        newestLikes,
      );
    });

    return PaginatedViewDto.mapToView({
      items,
      page: query.pageNumber,
      size: query.pageSize,
      totalCount,
    });
  }
}
