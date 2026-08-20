import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { PostViewModel } from './view-dto/post.view-dto';
import { PostsQwRepository } from '../../infrastructure/query/post.query.sql.repository';

export class GetPostByIdQuery extends Query<PostViewModel> {
  constructor(
    public id: string,
    public userId: string | null,
  ) {
    super();
  }
}

@QueryHandler(GetPostByIdQuery)
export class GetPostByIdQueryHandler implements IQueryHandler<
  GetPostByIdQuery,
  PostViewModel
> {
  constructor(private postsQwSqlRepository: PostsQwRepository) {}

  async execute({ id, userId }: GetPostByIdQuery): Promise<PostViewModel> {
    const post = await this.postsQwSqlRepository.getPostById(id, userId);
    return post;
  }
}
