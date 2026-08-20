import { Module } from '@nestjs/common';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { BlogsController } from './blogs/api/blogs.controller';
import { PostsController } from './posts/api/post.controller';
import { CommentsController } from './comments/api/comments.controller';
import { BlogsService } from './blogs/appllcation/blog.service';
import { PostsService } from './posts/appllcation/post.service';
import { CommentsService } from './comments/appllcation/comment.service';
import { GetBlogByIdQueryHandler } from './blogs/appllcation/queries/get-blog-by-id.query-handler';
import { GetBlogsQueryHandler } from './blogs/appllcation/queries/get-blogs.query-handler';
import { CommentRepository } from './comments/infrastructure/comment.repository';
import { GetCommentQueryHandler } from './comments/appllcation/queries/get-comments-query-handlers';
import { UpdateCommentCommandHandler } from './comments/appllcation/usecases/update.comment.useCases';
import { LikesCommentRepository } from './likes/infrastructure/likes.comment.repository';
import { UpdateCommentLikeStatusCommandHandler } from './comments/appllcation/usecases/update.comment.like-status-useCases';
import { DeleteCommentCommandHandler } from './comments/appllcation/usecases/delete.comment-useCases';
import { GetPostsByBlogIdQueryHandler } from './blogs/appllcation/queries/get-post-by-blogId-query-handler';
import { UpdateLikeStatusForPostCommandHandler } from './posts/appllcation/usecases/update-likeStatus-forPost-useCase';
import { CreateCommandByPostIdCommandHandler } from './posts/appllcation/usecases/create.comment-byPostId- useCases';
import { GetCommentByPostIdQueryHandler } from './posts/appllcation/queries/get-comment-byPostId-query';
import { PostsRepository } from './posts/infrastructure/post.sql.repository';
import { BlogsQwRepository } from './blogs/infrastructure/query/blogs.query.sql-repository';
import { SaBlogsController } from './blogs/api/sa.blogs.controller';
import { BlogsRepository } from './blogs/infrastructure/blog.sql.repository';
import { CreateBlogCommandHandler } from './blogs/appllcation/usecases/create.blog.usecases';
import { CreatePostByBlogIdCommandHandler } from './blogs/appllcation/usecases/create.post.by.blogId.usercase';
import { PostsQwRepository } from './posts/infrastructure/query/post.query.sql.repository';
import {
  DeletePostByBlogCommand,
  DeletePostByBlogCommandhandler,
} from './blogs/appllcation/usecases/delete.post.by.blog';
import { UpdateBlogsCommandHandler } from './blogs/appllcation/usecases/update.blog.usecases';
import { DeleteBlogCommandHandler } from './blogs/appllcation/usecases/delete.blog.usecases';
import { UpdatePostByBlogCommandHandler } from './blogs/appllcation/usecases/update.post.by.blog';
import { GetPostByIdQueryHandler } from './posts/appllcation/queries/get-post-by.id-query';
import { GetAllPostQueryHandler } from './posts/appllcation/queries/get-all-post-query';
import { CommentsQwRepository } from './comments/infrastructure/query/comment.qw-sql.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blog } from './blogs/domain/blog.entity';
import { Post } from './posts/domain/post.entity';
import { Comment } from './comments/domain/comment.entity';
import { LikePost } from './likes/domain/like.post.entity';
import { LikeComment } from './likes/domain/like.comment.entity';
import { LikesPostRepository } from './likes/infrastructure/likes.post.repository';

const QueryHandlers = [
  GetBlogByIdQueryHandler,
  GetBlogsQueryHandler,
  GetPostsByBlogIdQueryHandler,
  GetPostByIdQueryHandler,
  GetAllPostQueryHandler,
  GetCommentByPostIdQueryHandler,
  GetCommentQueryHandler,
];
const CommandHandlers = [
  UpdateCommentCommandHandler,
  UpdateCommentLikeStatusCommandHandler,
  DeleteCommentCommandHandler,
  UpdateLikeStatusForPostCommandHandler,
  CreateCommandByPostIdCommandHandler,
  CreateBlogCommandHandler,
  UpdateBlogsCommandHandler,
  DeletePostByBlogCommand,
  DeleteBlogCommandHandler,
  DeletePostByBlogCommandhandler,
  CreatePostByBlogIdCommandHandler,
  UpdatePostByBlogCommandHandler,
];
const Repository = [
  CommentsQwRepository,
  CommentRepository,
  LikesCommentRepository,
  LikesPostRepository,
  PostsRepository,
  PostsQwRepository,
  BlogsQwRepository,
  BlogsRepository,
];
@Module({
  imports: [
    UserAccountsModule,
    TypeOrmModule.forFeature([Blog, Post, Comment, LikePost, LikeComment]),
  ],
  controllers: [
    PostsController,
    BlogsController,
    SaBlogsController,
    CommentsController,
  ],
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
