import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import {
  NewestLikesDbModel,
  // NewestLikesForPost,
} from '../../posts/infrastructure/query/type/newest.likes.for.post.type';
import { LikeComment } from '../domain/like.comment.entity';
import { Injectable } from '@nestjs/common';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';

@Injectable()
export class LikesCommentRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(LikeComment)
    private likeCommentRepository: Repository<LikeComment>,
  ) {}

  async save(like: LikeComment): Promise<void> {
    await this.likeCommentRepository.save(like);
  }

  //ЗАГЛДУШКА
  async findNewestLikesDbForPost(
    postId: string,
  ): Promise<NewestLikesDbModel[]> {
    await Promise.resolve();
    console.log(postId);
    return [];
  }

  //лайки для комментариев
  async findLikeForСomment(
    userId: string,
    commentId: string,
  ): Promise<LikeComment | null> {
    const like = await this.likeCommentRepository.findOne({
      where: { userId, commentId },
    });
    if (!like) return null;

    return like;
  }

  async findLikesForComments(
    userId: string,
    commentIds: string[],
  ): Promise<LikeComment[]> {
    if (commentIds.length === 0) {
      return [];
    }

    return await this.likeCommentRepository.find({
      where: { userId, commentId: In(commentIds) },
    });
  }

  async deleteForComment(id: string): Promise<void> {
    const result = await this.likeCommentRepository.delete(id);

    if (result.affected === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'like not found',
      });
    }
  }
}
