import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from 'src/modules/bloggers-platform/posts/infrastructure/post.sql.repository';
import { BlogsRepository } from '../../infrastructure/blog.sql.repository';

export class UpdatePostByBlogCommand extends Command<void> {
  constructor(
    public blogId: string,
    public postId: string,
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
    private postsSqlRepository: PostsRepository,
    private blogsSqlRepository: BlogsRepository,
  ) {}

  async execute({
    postId,
    blogId,
    title,
    shortDescription,
    content,
  }: UpdatePostByBlogCommand): Promise<void> {
    await this.blogsSqlRepository.getByIdOrNotFoundFail(blogId);
    const post = await this.postsSqlRepository.findByIdAndBlogIdOrNotFoundFail(
      postId,
      blogId,
    );
    post.updatePost(title, shortDescription, content);
    await this.postsSqlRepository.save(post);
  }
}
