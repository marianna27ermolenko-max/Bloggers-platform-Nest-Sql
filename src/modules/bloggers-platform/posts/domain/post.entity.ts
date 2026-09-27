import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Blog } from '../../blogs/domain/blog.entity';
import { Comment } from '../../comments/domain/comment.entity';
import { BaseDBEntity } from '../../../../core/BaseDBEntity';
import { LikePost, LikeStatus } from '../../likes/domain/like.post.entity';

@Entity()
export class Post extends BaseDBEntity {
  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar' })
  shortDescription: string;

  @Column({ type: 'varchar', length: 300 })
  content: string;

  @Column({ type: 'uuid' })
  blogId: string;

  @Column({ type: 'int', default: 0 })
  likesCount: number;

  @Column({ type: 'int', default: 0 })
  dislikesCount: number;

  @ManyToOne(() => Blog, (blog) => blog.posts, {
    onDelete: 'CASCADE',
  })
  // user: User; //я могу использовать в коде только тогда когда подгружу relations в запросе
  @JoinColumn({ name: 'blogId' })
  blog: Blog;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @OneToMany(() => LikePost, (like) => like.post)
  likes: LikePost[];

  static createPost(
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
  ): Post {
    const post = new Post();
    post.title = title;
    post.shortDescription = shortDescription;
    post.content = content;
    post.blogId = blogId;

    return post;
  }

  updatePost(title: string, shortDescription: string, content: string): Post {
    this.title = title;
    this.shortDescription = shortDescription;
    this.content = content;

    return this;
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
