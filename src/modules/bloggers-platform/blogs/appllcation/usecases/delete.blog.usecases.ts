import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../infrastructure/blog.sql.repository';

export class DeleteBlogCommand extends Command<void> {
  constructor(public id: string) {
    super();
  }
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogCommandHandler implements ICommandHandler<
  DeleteBlogCommand,
  void
> {
  constructor(private blogsSqlRepository: BlogsRepository) {}

  async execute({ id }: DeleteBlogCommand): Promise<void> {
    await this.blogsSqlRepository.deleteBlog(id);
  }
}
