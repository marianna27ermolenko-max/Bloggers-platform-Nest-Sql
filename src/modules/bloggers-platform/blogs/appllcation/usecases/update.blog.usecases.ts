import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../infrastructure/blog.sql.repository';

export class UpdateBlogsCommand extends Command<void> {
  constructor(
    public id: string,
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
  constructor(private blogsSqlRepository: BlogsRepository) {}

  async execute({
    id,
    name,
    description,
    websiteUrl,
  }: UpdateBlogsCommand): Promise<void> {
    const blog = await this.blogsSqlRepository.getByIdOrNotFoundFail(id);
    blog.updateBlog(name, description, websiteUrl);
    await this.blogsSqlRepository.save(blog);
  }
}
