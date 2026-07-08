import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsSqlRepository } from '../../infrastructure/blog.sql.repository';

export class DeletePostByBlogCommand extends Command<void> {
  constructor(
    public blogId: number,
    public postId: number,
  ) {
    super();
  }
}

@CommandHandler(DeletePostByBlogCommand)
export class DeletePostByBlogCommandhandler implements ICommandHandler<
  DeletePostByBlogCommand,
  void
> {
  constructor(private blogsSqlRepository: BlogsSqlRepository) {}

  async execute({ postId, blogId }: DeletePostByBlogCommand): Promise<void> {
    await this.blogsSqlRepository.deletePostByBlog(postId, blogId);
  }
}
