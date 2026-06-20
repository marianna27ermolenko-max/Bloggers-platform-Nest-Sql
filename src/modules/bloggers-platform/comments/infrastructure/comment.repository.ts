import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Comment,
  CommentDocument,
  type CommentModelType,
} from '../domain/comment.entity';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';

@Injectable()
export class CommentRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
  ) {}

  async save(comment: CommentDocument): Promise<void> {
    await comment.save();
  }

  async getByIdOrNotFoundFail(id: string): Promise<CommentDocument> {
    const comment = await this.CommentModel.findOne({ _id: id });
    if (!comment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'comment not found',
      });
    }
    return comment;
  }

  async deleteComment(commentId: string) {
    await this.CommentModel.deleteOne({
      _id: commentId,
    });
  }
}
