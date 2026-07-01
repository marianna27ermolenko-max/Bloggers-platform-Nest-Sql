// import { DomainException } from 'src/core/exceptions/domain-exceptions';
// import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
// import { PostRepositoryModel } from './type/post.pojo-model';

export class PostsSqlRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {
    //   async getByIdOrNotFoundFail(id: number): Promise<PostRepositoryModel> {
    // const post = await this.PostModel.findOne({ _id: id });
    // if (!post) {
    //   throw new DomainException({
    //     code: DomainExceptionCode.NotFound,
    //     message: 'post not found',
    //   });
    // }
    // return post;
  }

  //   async deletePost(id: number): Promise<boolean> {
  //     const result = await this.PostModel.deleteOne({ _id: id });
  //     return result.deletedCount === 1;
  //   }
}
