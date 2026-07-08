import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsSqlRepository } from 'src/modules/bloggers-platform/posts/infrastructure/post.sql.repository';
import { BlogsSqlRepository } from '../../infrastructure/blog.sql.repository';

export class UpdatePostByBlogCommand extends Command<void> {
  constructor(
    public blogId: number,
    public postId: number,
    public title: string,
    public shortDescription: string,
    public content: string,
  ) {
    super();
  }
}

@CommandHandler(UpdatePostByBlogCommand)
export class UpdatePostByBlogCommandHandler implements ICommandHandler<
  UpdatePostByBlogCommand,
  void
> {
  constructor(
    private postsSqlRepository: PostsSqlRepository,
    private blogsSqlRepository: BlogsSqlRepository,
  ) {}

  async execute({
    postId,
    blogId,
    title,
    shortDescription,
    content,
  }: UpdatePostByBlogCommand): Promise<void> {
    await this.blogsSqlRepository.getByIdOrNotFoundFail(blogId);
    await this.postsSqlRepository.updatePostByBlog(postId, blogId, {
      title,
      shortDescription,
      content,
    });
  }
}
