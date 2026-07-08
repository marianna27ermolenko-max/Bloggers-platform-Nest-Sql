import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsSqlRepository } from '../../infrastructure/blog.sql.repository';

export class UpdateBlogsCommand extends Command<void> {
  constructor(
    public id: number,
    public name: string,
    public description: string,
    public websiteUrl: string,
  ) {
    super();
  }
}

@CommandHandler(UpdateBlogsCommand)
export class UpdateBlogsCommandHandler implements ICommandHandler<
  UpdateBlogsCommand,
  void
> {
  constructor(private blogsSqlRepository: BlogsSqlRepository) {}

  async execute({
    id,
    name,
    description,
    websiteUrl,
  }: UpdateBlogsCommand): Promise<void> {
    await this.blogsSqlRepository.updateBlog(id, {
      name,
      description,
      websiteUrl,
    });
  }
}
