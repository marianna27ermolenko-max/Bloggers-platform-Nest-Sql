import { Injectable } from '@nestjs/common';
import { LikePost, LikeStatus } from '../domain/like.post.entity';
import { DataSource, In, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import {
  NewestLikesDbModel,
  NewestLikesForPost,
} from '../../posts/infrastructure/query/type/newest.likes.for.post.type';

@Injectable()
export class LikesPostRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(LikePost)
    private likePostRepository: Repository<LikePost>,
  ) {}

  async save(like: LikePost): Promise<void> {
    await this.likePostRepository.save(like);
  }

  async findLike(userId: string, postId: string): Promise<LikePost | null> {
    const result = await this.likePostRepository.findOne({
      where: { userId, postId },
    });

    if (!result) {
      return null;
    }

    return result;
  }

  async findLikesForPosts(
    userId: string,
    postIds: string[],
  ): Promise<LikePost[]> {
    if (postIds.length === 0) {
      return [];
    }

    return await this.likePostRepository.find({
      where: { userId, postId: In(postIds) },
    });
  }

  async findNewestLikesDbForPosts(
    postIds: string[],
  ): Promise<NewestLikesDbModel[]> {
    if (postIds.length === 0) {
      return [];
    }

    const subQuery = this.likePostRepository
      .createQueryBuilder('l')
      .select([
        'l.postId AS "postId"',
        'l.userId AS "userId"',
        'l.createdAt AS "addedAt"',
        'l.login AS "login"',
        `
        ROW_NUMBER() OVER (
          PARTITION BY l."postId"
          ORDER BY l."createdAt" DESC, l.id DESC
        ) AS "rn"
      `,
      ])
      .where({
        postId: In(postIds),
      })
      .andWhere('l.likeStatus = :likeStatus', {
        likeStatus: LikeStatus.Like,
      });

    const likes: NewestLikesDbModel[] = await this.dataSource
      .createQueryBuilder()
      .select([
        '"likes"."postId" AS "postId"',
        '"likes"."userId" AS "userId"',
        '"likes"."addedAt" AS "addedAt"',
        '"likes"."login" AS "login"',
      ])
      .from(`(${subQuery.getQuery()})`, 'likes')
      .setParameters(subQuery.getParameters())
      .where('"likes"."rn" <= 3')
      .orderBy('"likes"."postId"', 'ASC')
      .addOrderBy('"likes"."addedAt"', 'DESC')
      .getRawMany();

    return likes;
  }

  async findNewestLikesDbForPost(
    postId: string,
  ): Promise<NewestLikesForPost[]> {
    const likes: NewestLikesForPost[] = await this.likePostRepository
      .createQueryBuilder('l')
      .select([
        'l.userId as "userId"',
        'l.createdAt as "addedAt"',
        'l.login as "login"',
      ])
      .where('l.postId = :postId', { postId })
      .andWhere('l.likeStatus = :likeStatus', {
        likeStatus: LikeStatus.Like,
      })
      .orderBy('l.createdAt', 'DESC')
      .take(3)
      .getRawMany();

    return likes;
  }

  async deleteLike(id: string): Promise<void> {
    const result = await this.likePostRepository.delete({ id });

    if (result.affected === 0) {
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: 'like for post not delete',
      });
    }
  }
}
