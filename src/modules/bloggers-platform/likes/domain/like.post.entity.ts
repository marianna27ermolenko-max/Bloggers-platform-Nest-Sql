// export enum ParentType {
//   Comment = 'Comment',
//   Post = 'Post',
// }

import { BaseDBEntity } from '../../../../core/BaseDBEntity';
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { Post } from '../../posts/domain/post.entity';

export enum LikeStatus {
  Like = 'Like',
  Dislike = 'Dislike',
  None = 'None',
}

@Unique(['userId', 'postId']) //или лучшке более явно? - Индекс
@Entity()
export class LikePost extends BaseDBEntity {
  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  postId: string;

  @Column({ type: 'varchar' })
  login: string;

  @Column({ type: 'enum', enum: LikeStatus })
  likeStatus: LikeStatus;

  @ManyToOne(() => Post, (post) => post.likes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'postId' })
  post: Post;

  static create(
    userId: string,
    postId: string,
    login: string,
    likeStatus: LikeStatus,
  ): LikePost {
    const like = new LikePost();
    like.userId = userId;
    like.postId = postId;
    like.login = login;
    like.likeStatus = likeStatus;

    return like;
  }

  updateStatus(likeStatus: LikeStatus) {
    this.likeStatus = likeStatus;
  }
}
