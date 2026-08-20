import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from 'src/modules/bloggers-platform/posts/infrastructure/post.sql.repository';

export class DeletePostByBlogCommand extends Command<void> {
  constructor(
    public blogId: string,
    public postId: string,
  ) {
    super();
  }
}

@CommandHandler(DeletePostByBlogCommand)
export class DeletePostByBlogCommandhandler implements ICommandHandler<
  DeletePostByBlogCommand,
  void
> {
  constructor(private postsRepository: PostsRepository) {}

  async execute({ postId, blogId }: DeletePostByBlogCommand): Promise<void> {
    await this.postsRepository.deletePostByBlog(postId, blogId);
  }
}
