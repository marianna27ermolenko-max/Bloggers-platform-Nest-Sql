import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { PostViewModel } from 'src/modules/bloggers-platform/posts/appllcation/queries/view-dto/post.view-dto';
// import { PostsFilter } from './type/filter.type';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import {
  LikeStatus,
  // ParentType,
} from 'src/modules/bloggers-platform/likes/domain/like.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostDtoForViewModel } from '../../appllcation/queries/view-dto/post.dto.for.view.model';
import { CountResult } from 'src/modules/user-accounts/user/infrastructure/query/type/type.totalCount';
import {
  postsSortMap as postsByBlogSortMap,
  postsSortMap,
} from '../../api/input-dto/post-sort.by';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PostsQwSqlRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getAll(
    query: GetPostsQueryParams,
    // userId: string | null,
  ): Promise<PaginatedViewDto<PostViewModel[]>> {
    console.log('QUERY:', query);
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

    console.log('POSTS:', posts);

    const count: CountResult[] = await this.dataSource.query(`
      SELECT COUNT (*) AS "totalCount" 
      FROM posts`);

    const totalCount = Number(count[0].totalCount);

    // const filter: PostsFilter = {};
    // const posts = await this.PostModel.find(filter)
    //   .sort({
    //     [query.sortBy]: query.sortDirection,
    //   })
    //   .skip(query.calculateSkip())
    //   .limit(query.pageSize);
    // const totalCount = await this.PostModel.countDocuments(filter);
    // const postIds = posts.map((p) => p._id.toString());
    // // my likes
    // const myLikes = userId
    //   ? await this.LikeModel.find({
    //       userId,
    //       parentType: ParentType.Post,
    //       parentId: { $in: postIds },
    //     })
    //   : [];
    // const myLikesMap = new Map<string, LikeStatus>();
    // for (const like of myLikes) {
    //   myLikesMap.set(like.parentId.toString(), like.likeStatus);
    // }
    // //newest likes (ТОЛЬКО Like)
    // const newestLikesDb = await this.LikeModel.find({
    //   parentType: ParentType.Post,
    //   parentId: { $in: postIds },
    //   likeStatus: LikeStatus.Like,
    // }).sort({ parentId: 1, createdAt: -1 });
    // const newestLikesMap = new Map<
    //   string,
    //   { addedAt: string; userId: string; login: string }[]
    // >();
    // for (const like of newestLikesDb) {
    //   const key = like.parentId.toString();
    //   if (!newestLikesMap.has(key)) {
    //     newestLikesMap.set(key, []);
    //   }
    //   const arr = newestLikesMap.get(key)!;
    //   if (arr.length < 3) {
    //     arr.push({
    //       addedAt: like.createdAt.toISOString(),
    //       userId: like.userId,
    //       login: like.login,
    //     });
    //   }
    // }
    const items = posts.map((post) => {
      // const id = post.id.toString();
      const myStatus = /*  myLikesMap.get(id) ??  */ LikeStatus.None;
      const newestLikes = /* newestLikesMap.get(id) ?? */ [];
      return PostViewModel.mapToView(post, myStatus, newestLikes);
    });

    return PaginatedViewDto.mapToView({
      items,
      page: query.pageNumber,
      size: query.pageSize,
      totalCount,
    });
  }

  async getByIdOrNotFoundFail(
    id: number,
    // userId?: number | null,
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
    const myStatus = LikeStatus.None;

    // if (userId) {
    //   const like = await this.LikeModel.findOne({
    //     parentId: id,
    //     parentType: ParentType.Post,
    //     userId,
    //   });

    //   myStatus = like?.likeStatus ?? LikeStatus.None;
    // }

    // const newestLikesDb = await this.LikeModel.find({
    //   parentId: id,
    //   parentType: ParentType.Post,
    //   likeStatus: LikeStatus.Like,
    // })
    //   .sort({ createdAt: -1 })
    //   .limit(3);

    // const newestLikes = newestLikesDb.map((l) => ({
    //   addedAt: l.createdAt.toISOString(),
    //   userId: l.userId,
    //   login: l.login ?? '',
    // }));

    return PostViewModel.mapToView(foundPost, myStatus);
  }

  async getAllByBlogId(
    blogId: number,
    query: GetPostsQueryParams,
    // userId: string | null,
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

    //     const filter: PostsFilter = { blogId };
    //     const posts = await this.PostModel.find(filter)
    //       .sort({
    //         [query.sortBy]: query.sortDirection,
    //       })
    //       .skip(query.calculateSkip())
    //       .limit(query.pageSize);
    //     const totalCount = await this.PostModel.countDocuments(filter);
    //     const postIds = posts.map((p) => p._id.toString());
    //     //все лайки юзера к этим постам (массив)
    //     const myLikes = userId
    //       ? await this.LikeModel.find({
    //           userId,
    //           parentType: ParentType.Post,
    //           parentId: { $in: postIds },
    //         })
    //       : [];
    //     const myLikesMap = new Map<string, LikeStatus>();
    //     for (const like of myLikes) {
    //       myLikesMap.set(like.parentId.toString(), like.likeStatus);
    //     }
    //     //все лайки к последним 3 постам (массив)
    //     const newestLikesDb = await this.LikeModel.find({
    //       parentId: { $in: postIds },
    //       parentType: ParentType.Post,
    //       likeStatus: LikeStatus.Like,
    //     }).sort({ parentId: 1, createdAt: -1 });
    //     const newestLikesMap = new Map<
    //       string,
    //       { addedAt: string; userId: string; login: string }[]
    //     >();
    //     for (const like of newestLikesDb) {
    //       const key = like.parentId.toString();
    //       if (!newestLikesMap.has(key)) {
    //         newestLikesMap.set(key, []);
    //       }
    //       const arr = newestLikesMap.get(key)!;
    //       if (arr.length < 3) {
    //         arr.push({
    //           addedAt: like.createdAt.toISOString(),
    //           userId: like.userId,
    //           login: like.login ?? '',
    //         });
    //       }
    //     }
    const count: CountResult[] = await this.dataSource.query(
      `
      SELECT COUNT(*) AS "totalCount"
      FROM posts
      WHERE blog_id = $1`,
      [blogId],
    );

    const totalCount = Number(count[0].totalCount);

    const items: PostViewModel[] = posts.map((post) => {
      // const postId = post.id.toString();
      const myStatus = /* myLikesMap.get(postId) ?? */ LikeStatus.None;
      const newestLikes = /* newestLikesMap.get(postId) ?? */ [];
      return PostViewModel.mapToView(post, myStatus, newestLikes);
    });

    return PaginatedViewDto.mapToView({
      items,
      page: query.pageNumber,
      size: query.pageSize,
      totalCount,
    });

    //     // const items: PostViewModel[] = await Promise.all(
    //     //   posts.map(async (post) => {
    //     //     let myStatus = LikeStatus.None;
    //     //     if (userId) {
    //     //       const like = await this.LikeModel.findOne({
    //     //         userId,
    //     //         parentId: post._id.toString(),
    //     //         parentType: ParentType.Post,
    //     //       });
    //     //       if (like) {
    //     //         myStatus = like.likeStatus;
    //     //       }
    //     //     }
    //     //     //ищем самые последние лайки - 3 шт
    //     //     const newestLikesDb = await this.LikeModel.find({
    //     //       parentId: post._id.toString(),
    //     //       likeStatus: LikeStatus.Like,
    //     //       parentType: ParentType.Post,
    //     //     })
    //     //       .sort({ createdAt: -1 })
    //     //       .limit(3);
    //     //     const newestLikes = newestLikesDb.map((l) => ({
    //     //       addedAt: l.createdAt.toISOString(),
    //     //       userId: l.userId,
    //     //       login: l.login ?? '',
    //     //     }));
    //     //     return PostViewModel.mapToView(post, myStatus, newestLikes);
    //     //   }),
    //     // );
  }
}
