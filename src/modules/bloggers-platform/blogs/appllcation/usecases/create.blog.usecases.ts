import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../infrastructure/blog.sql.repository';
import { Blog } from '../../domain/blog.entity';

export class CreateBlogCommand extends Command<string> {
  constructor(
    public name: string,
    public description: string,
    public websiteUrl: string,
  ) {
    super();
  }
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogCommandHandler implements ICommandHandler<
  CreateBlogCommand,
  string
> {
  constructor(private blogsSqlRepository: BlogsRepository) {}

  async execute(command: CreateBlogCommand): Promise<string> {
    const blog = Blog.createBlog(
      command.name,
      command.description,
      command.websiteUrl,
    );
    await this.blogsSqlRepository.save(blog);
    return blog.id;
  }
}
