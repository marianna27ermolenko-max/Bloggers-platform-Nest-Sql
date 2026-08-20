import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from 'src/modules/bloggers-platform/posts/infrastructure/post.sql.repository';
import { BlogsRepository } from '../../infrastructure/blog.sql.repository';
import { Post } from 'src/modules/bloggers-platform/posts/domain/post.entity';

export class CreatePostByBlogIdCommand extends Command<string> {
  constructor(
    public blogId: string,
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
  string
> {
  constructor(
    private postsSqlRepository: PostsRepository,
    private blogsSqlRepository: BlogsRepository,
  ) {}

  async execute(command: CreatePostByBlogIdCommand): Promise<string> {
    await this.blogsSqlRepository.getByIdOrNotFoundFail(command.blogId);
    const post = Post.createPost(
      command.title,
      command.shortDescription,
      command.content,
      command.blogId,
    );

    await this.postsSqlRepository.save(post);
    return post.id;
  }
}
