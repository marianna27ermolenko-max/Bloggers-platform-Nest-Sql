import { Module } from '@nestjs/common';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { BlogsController } from './blogs/api/blogs.controller';
import { PostsController } from './posts/api/post.controller';
import { CommentsController } from './comments/api/comments.controller';
import { BlogsQwRepository } from './blogs/infrastructure/query/blogs.query-repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './blogs/domain/blog.entity';
import { BlogsService } from './blogs/appllcation/blog.service';
import { BlogsRepository } from './blogs/infrastructure/blog.repository';
import { PostsService } from './posts/appllcation/post.service';
import { Post, PostSchema } from './posts/domain/post.entity';
import { PostsRepository } from './posts/infrastructure/post.repository';
import { PostsQwRepository } from './posts/infrastructure/query/post.query.repository';
import { Comment, CommentSchema } from './comments/domain/comment.entity';
import { CommentsService } from './comments/appllcation/comment.service';
import { CommentsQwRepository } from './comments/infrastructure/query/comment.qw.repository';
import { GetBlogByIdQueryHandler } from './blogs/appllcation/queries/get-blog-by-id.query-handler';
import { GetBlogsQueryHandler } from './blogs/appllcation/queries/get-blogs.query-handler';
import { CommentRepository } from './comments/infrastructure/comment.repository';
import { GetCommentQueryHandler } from './comments/appllcation/queries/get-comments-query-handlers';
import { Like, LikeSchema } from './likes/domain/like.entity';
import { UpdateCommentCommandHandler } from './comments/appllcation/usecases/update.comment.useCases';
import { LikesRepository } from './likes/infrastructure/likes.repository';
import { UpdateCommentLikeStatusCommandHandler } from './comments/appllcation/usecases/update.comment.like-status-useCases';
import { DeleteCommentCommandHandler } from './comments/appllcation/usecases/delete.comment-useCases';
import { GetPostsByBlogIdQueryHandler } from './blogs/appllcation/queries/get-post-by-blogId-query-handler';
import { UpdateLikeStatusForPostCommandHandler } from './posts/appllcation/usecases/update-likeStatus-forPost-useCase';
import { CreateCommandByPostIdCommandHandler } from './posts/appllcation/usecases/create.comment-byPostId- useCases';
import { GetCommentByPostIdQueryHandler } from './posts/appllcation/queries/get-comment-byPostId-query';
import { PostsSqlRepository } from './posts/infrastructure/post.sql.repository';

const QueryHandlers = [
  GetBlogByIdQueryHandler,
  GetBlogsQueryHandler,
  GetCommentQueryHandler,
  GetPostsByBlogIdQueryHandler,
  GetCommentByPostIdQueryHandler,
];
const CommandHandlers = [
  UpdateCommentCommandHandler,
  UpdateCommentLikeStatusCommandHandler,
  DeleteCommentCommandHandler,
  UpdateLikeStatusForPostCommandHandler,
  CreateCommandByPostIdCommandHandler,
];
const Repository = [
  BlogsRepository,
  PostsRepository,
  BlogsQwRepository,
  PostsQwRepository,
  CommentsQwRepository,
  CommentRepository,
  LikesRepository,
  PostsSqlRepository,
];
@Module({
  imports: [
    UserAccountsModule,
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Like.name, schema: LikeSchema },
    ]),
  ],
  controllers: [PostsController, BlogsController, CommentsController],
  providers: [
    BlogsService,
    PostsService,
    CommentsService,
    ...QueryHandlers,
    ...Repository,
    ...CommandHandlers,
  ],
})
export class BloggersPlatformModule {}
