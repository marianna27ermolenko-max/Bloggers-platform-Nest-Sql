import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsSqlRepository } from '../../infrastructure/blog.sql.repository';
import { BlogsQwSqlRepository } from '../../infrastructure/query/blogs.query.sql-repository';

export class CreateBlogCommand extends Command<number> {
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
  number
> {
  constructor(
    private blogsSqlRepository: BlogsSqlRepository,
    private blogsQwSqlRepository: BlogsQwSqlRepository,
  ) {}

  async execute(command: CreateBlogCommand): Promise<number> {
    const blogId = await this.blogsSqlRepository.createBlog(command);
    return blogId;
  }
}
