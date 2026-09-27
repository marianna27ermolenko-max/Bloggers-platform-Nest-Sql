import { BaseDBEntity } from '../../../../core/BaseDBEntity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Post } from '../../posts/domain/post.entity';
import {
  LikeComment,
  LikeStatus,
} from '../../likes/domain/like.comment.entity';

@Entity()
export class Comment extends BaseDBEntity {
  @Column({ type: 'varchar' })
  content: string;

  @Column({ type: 'uuid' })
  postId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar' })
  userLogin: string;

  @Column({ type: 'int', default: 0 })
  likesCount: number;

  @Column({ type: 'int', default: 0 })
  dislikesCount: number;

  @ManyToOne(() => Post, (post) => post.comments, {
    onDelete: 'CASCADE',
  })
  // post: Post; //я могу использовать в коде только тогда когда подгружу relations в запросе
  @JoinColumn({ name: 'postId' })
  post: Post;

  @OneToMany(() => LikeComment, (like) => like.comment)
  likes: LikeComment[];

  static create(
    content: string,
    postId: string,
    userId: string,
    userLogin: string,
  ): Comment {
    const comment = new Comment();
    comment.content = content;
    comment.postId = postId;
    comment.userId = userId;
    comment.userLogin = userLogin;

    return comment;
  }

  update(content: string) {
    this.content = content;
  }

  addLike() {
    this.likesCount += 1;
  }

  addDislike() {
    this.dislikesCount += 1;
  }

  deleteLike() {
    this.likesCount = Math.max(0, this.likesCount - 1);
  }

  deleteDislike() {
    this.dislikesCount = Math.max(0, this.dislikesCount - 1);
  }

  countNewLike(likeStatus: LikeStatus) {
    if (likeStatus === LikeStatus.Like) {
      this.addLike();
    } else if (likeStatus === LikeStatus.Dislike) {
      this.addDislike();
    }
  }

  updateCountLikes(newLike: LikeStatus, oldLike: LikeStatus) {
    if (newLike === LikeStatus.Like && oldLike === LikeStatus.Dislike) {
      this.addLike();
      this.deleteDislike();
    } else if (newLike === LikeStatus.Dislike && oldLike === LikeStatus.Like) {
      this.addDislike();
      this.deleteLike();
    } else if (newLike === LikeStatus.None && oldLike === LikeStatus.Like) {
      this.deleteLike();
    } else if (newLike === LikeStatus.None && oldLike === LikeStatus.Dislike) {
      this.deleteDislike();
    }
  }
}
