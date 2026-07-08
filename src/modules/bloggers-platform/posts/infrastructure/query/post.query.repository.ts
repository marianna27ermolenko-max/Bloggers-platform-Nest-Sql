import { InjectModel } from '@nestjs/mongoose';
import { Post, type PostModelType } from '../../domain/post.entity';
// import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
// import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
// import { PostViewModel } from 'src/modules/bloggers-platform/posts/appllcation/queries/view-dto/post.view-dto';
// import { PostsFilter } from './type/filter.type';
// import { DomainException } from 'src/core/exceptions/domain-exceptions';
// import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import {
  Like,
  type LikeModelType,
  //   LikeStatus,
  //   ParentType,
} from 'src/modules/bloggers-platform/likes/domain/like.entity';

export class PostsQwRepository {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectModel(Like.name) private LikeModel: LikeModelType,
  ) {}

  // async getAll(
  //   query: GetPostsQueryParams,
  //   userId: string | null,
  // ): Promise<PaginatedViewDto<PostViewModel[]>> {
  //   const filter: PostsFilter = {};

  //   const posts = await this.PostModel.find(filter)
  //     .sort({
  //       [query.sortBy]: query.sortDirection,
  //     })
  //     .skip(query.calculateSkip())
  //     .limit(query.pageSize);

  //   const totalCount = await this.PostModel.countDocuments(filter);

  //   const postIds = posts.map((p) => p._id.toString());

  //   // my likes
  //   const myLikes = userId
  //     ? await this.LikeModel.find({
  //         userId,
  //         parentType: ParentType.Post,
  //         parentId: { $in: postIds },
  //       })
  //     : [];

  //   const myLikesMap = new Map<string, LikeStatus>();

  //   for (const like of myLikes) {
  //     myLikesMap.set(like.parentId.toString(), like.likeStatus);
  //   }

  //   //newest likes (ТОЛЬКО Like)
  //   const newestLikesDb = await this.LikeModel.find({
  //     parentType: ParentType.Post,
  //     parentId: { $in: postIds },
  //     likeStatus: LikeStatus.Like,
  //   }).sort({ parentId: 1, createdAt: -1 });

  //   const newestLikesMap = new Map<
  //     string,
  //     { addedAt: string; userId: string; login: string }[]
  //   >();

  //   for (const like of newestLikesDb) {
  //     const key = like.parentId.toString();

  //     if (!newestLikesMap.has(key)) {
  //       newestLikesMap.set(key, []);
  //     }

  //     const arr = newestLikesMap.get(key)!;

  //     if (arr.length < 3) {
  //       arr.push({
  //         addedAt: like.createdAt.toISOString(),
  //         userId: like.userId,
  //         login: like.login,
  //       });
  //     }
  //   }

  //   const items = posts.map((post) => {
  //     const id = post._id.toString();

  //     const myStatus = myLikesMap.get(id) ?? LikeStatus.None;
  //     const newestLikes = newestLikesMap.get(id) ?? [];

  //     return PostViewModel.mapToView(post, myStatus, newestLikes);
  //   });

  //   return PaginatedViewDto.mapToView({
  //     items,
  //     page: query.pageNumber,
  //     size: query.pageSize,
  //     totalCount,
  //   });
  // }

  // async getByIdOrNotFoundFail(
  //   id: string,
  //   userId?: string | null,
  // ): Promise<PostViewModel> {
  //   const post = await this.PostModel.findOne({ _id: id });
  //   if (!post) {
  //     throw new DomainException({
  //       code: DomainExceptionCode.NotFound,
  //       message: 'post not found',
  //     });
  //   }

  //   //вычисляем статус
  //   let myStatus = LikeStatus.None;

  //   if (userId) {
  //     const like = await this.LikeModel.findOne({
  //       parentId: id,
  //       parentType: ParentType.Post,
  //       userId,
  //     });

  //     myStatus = like?.likeStatus ?? LikeStatus.None;
  //   }

  //   const newestLikesDb = await this.LikeModel.find({
  //     parentId: id,
  //     parentType: ParentType.Post,
  //     likeStatus: LikeStatus.Like,
  //   })
  //     .sort({ createdAt: -1 })
  //     .limit(3);

  //   const newestLikes = newestLikesDb.map((l) => ({
  //     addedAt: l.createdAt.toISOString(),
  //     userId: l.userId,
  //     login: l.login ?? '',
  //   }));

  //   return PostViewModel.mapToView(post, myStatus, newestLikes);
  // }

  // async getAllByBlogId(
  //   blogId: string,
  //   query: GetPostsQueryParams,
  //   userId: string | null,
  // ): Promise<PaginatedViewDto<PostViewModel[]>> {
  //   const filter: PostsFilter = { blogId };

  //   const posts = await this.PostModel.find(filter)
  //     .sort({
  //       [query.sortBy]: query.sortDirection,
  //     })
  //     .skip(query.calculateSkip())
  //     .limit(query.pageSize);

  //   const totalCount = await this.PostModel.countDocuments(filter);

  //   const postIds = posts.map((p) => p._id.toString());

  //   //все лайки юзера к этим постам (массив)
  //   const myLikes = userId
  //     ? await this.LikeModel.find({
  //         userId,
  //         parentType: ParentType.Post,
  //         parentId: { $in: postIds },
  //       })
  //     : [];

  //   const myLikesMap = new Map<string, LikeStatus>();

  //   for (const like of myLikes) {
  //     myLikesMap.set(like.parentId.toString(), like.likeStatus);
  //   }

  //   //все лайки к последним 3 постам (массив)
  //   const newestLikesDb = await this.LikeModel.find({
  //     parentId: { $in: postIds },
  //     parentType: ParentType.Post,
  //     likeStatus: LikeStatus.Like,
  //   }).sort({ parentId: 1, createdAt: -1 });

  //   const newestLikesMap = new Map<
  //     string,
  //     { addedAt: string; userId: string; login: string }[]
  //   >();

  //   for (const like of newestLikesDb) {
  //     const key = like.parentId.toString();

  //     if (!newestLikesMap.has(key)) {
  //       newestLikesMap.set(key, []);
  //     }

  //     const arr = newestLikesMap.get(key)!;

  //     if (arr.length < 3) {
  //       arr.push({
  //         addedAt: like.createdAt.toISOString(),
  //         userId: like.userId,
  //         login: like.login ?? '',
  //       });
  //     }
  //   }

  //   const items: PostViewModel[] = posts.map((post) => {
  //     const postId = post._id.toString();

  //     const myStatus = myLikesMap.get(postId) ?? LikeStatus.None;

  //     const newestLikes = newestLikesMap.get(postId) ?? [];

  //     return PostViewModel.mapToView(post, myStatus, newestLikes);
  //   });

  //   return PaginatedViewDto.mapToView({
  //     items,
  //     page: query.pageNumber,
  //     size: query.pageSize,
  //     totalCount,
  //   });

  // const items: PostViewModel[] = await Promise.all(
  //   posts.map(async (post) => {
  //     let myStatus = LikeStatus.None;

  //     if (userId) {
  //       const like = await this.LikeModel.findOne({
  //         userId,
  //         parentId: post._id.toString(),
  //         parentType: ParentType.Post,
  //       });

  //       if (like) {
  //         myStatus = like.likeStatus;
  //       }
  //     }

  //     //ищем самые последние лайки - 3 шт
  //     const newestLikesDb = await this.LikeModel.find({
  //       parentId: post._id.toString(),
  //       likeStatus: LikeStatus.Like,
  //       parentType: ParentType.Post,
  //     })
  //       .sort({ createdAt: -1 })
  //       .limit(3);

  //     const newestLikes = newestLikesDb.map((l) => ({
  //       addedAt: l.createdAt.toISOString(),
  //       userId: l.userId,
  //       login: l.login ?? '',
  //     }));

  //     return PostViewModel.mapToView(post, myStatus, newestLikes);
  //   }),
  // );
  // }
}
