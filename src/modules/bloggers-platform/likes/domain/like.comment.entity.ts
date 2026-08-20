import { BaseDBEntity } from '../../../../core/BaseDBEntity';
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { Comment } from '../../comments/domain/comment.entity';

export enum LikeStatus {
  Like = 'Like',
  Dislike = 'Dislike',
  None = 'None',
}

@Unique(['userId', 'commentId'])
@Entity()
export class LikeComment extends BaseDBEntity {
  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  commentId: string;

  @Column({ type: 'varchar' })
  login: string;

  @Column({ type: 'enum', enum: LikeStatus })
  likeStatus: LikeStatus;

  @ManyToOne(() => Comment, (comment) => comment.likes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'commentId' })
  comment: Comment;

  static createLike(
    userId: string,
    commentId: string,
    login: string,
    likeStatus: LikeStatus,
  ): LikeComment {
    const like = new LikeComment();
    like.userId = userId;
    like.commentId = commentId;
    like.login = login;
    like.likeStatus = likeStatus;

    return like;
  }

  updateStatus(likeStatus: LikeStatus) {
    this.likeStatus = likeStatus;
  }
}
