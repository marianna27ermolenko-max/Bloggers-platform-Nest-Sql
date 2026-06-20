import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument, type PostModelType } from '../domain/post.entity';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';

export class PostsRepository {
  constructor(@InjectModel(Post.name) private PostModel: PostModelType) {}

  async save(post: PostDocument): Promise<void> {
    await post.save();
  }

  async getByIdOrNotFoundFail(id: string): Promise<PostDocument> {
    const post = await this.PostModel.findOne({ _id: id });
    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'post not found',
      });
    }
    return post;
  }

  async deletePost(id: string): Promise<boolean> {
    const result = await this.PostModel.deleteOne({ _id: id });
    return result.deletedCount === 1;
  }
}
