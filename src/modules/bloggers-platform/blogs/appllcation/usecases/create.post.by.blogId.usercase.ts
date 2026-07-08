import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsSqlRepository } from 'src/modules/bloggers-platform/posts/infrastructure/post.sql.repository';
import { BlogsSqlRepository } from '../../infrastructure/blog.sql.repository';

export class CreatePostByBlogIdCommand extends Command<number> {
  constructor(
    public blogId: number,
    public title: string,
    public shortDescription: string,
    public content: string,
  ) {
    super();
  }
}

@CommandHandler(CreatePostByBlogIdCommand)
export class CreatePostByBlogIdCommandHandler implements ICommandHandler<
  CreatePostByBlogIdCommand,
  number
> {
  constructor(
    private postsSqlRepository: PostsSqlRepository,
    private blogsSqlRepository: BlogsSqlRepository,
  ) {}

  async execute(command: CreatePostByBlogIdCommand): Promise<number> {
    await this.blogsSqlRepository.getByIdOrNotFoundFail(command.blogId);
    const postId = await this.postsSqlRepository.createPostByBlog(command);
    return postId;
  }
}
