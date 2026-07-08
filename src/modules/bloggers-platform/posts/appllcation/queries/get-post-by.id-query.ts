import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { PostViewModel } from './view-dto/post.view-dto';
import { PostsQwSqlRepository } from '../../infrastructure/query/post.query.sql.repository';

export class GetPostByIdQuery extends Query<PostViewModel> {
  constructor(public id: number) {
    super();
  }
}

@QueryHandler(GetPostByIdQuery)
export class GetPostByIdQueryHandler implements IQueryHandler<
  GetPostByIdQuery,
  PostViewModel
> {
  constructor(private postsQwSqlRepository: PostsQwSqlRepository) {}

  async execute({ id }: GetPostByIdQuery): Promise<PostViewModel> {
    const post = await this.postsQwSqlRepository.getByIdOrNotFoundFail(id);
    return post;
  }
}
