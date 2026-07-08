import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsSqlRepository } from '../../infrastructure/blog.sql.repository';

export class DeleteBlogCommand extends Command<void> {
  constructor(public id: number) {
    super();
  }
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogCommandHandler implements ICommandHandler<
  DeleteBlogCommand,
  void
> {
  constructor(private blogsSqlRepository: BlogsSqlRepository) {}

  async execute({ id }: DeleteBlogCommand): Promise<void> {
    await this.blogsSqlRepository.deleteBlog(id);
  }
}
