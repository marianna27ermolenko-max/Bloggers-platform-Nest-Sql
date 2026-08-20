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

// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import {
//   CommentatorInfo,
//   CommentatorInfoSchema,
// } from './commentatorInfo.schema';
// import { HydratedDocument, Model } from 'mongoose';
// import { CommentInputDto } from '../api/input-dto/comment.input-dto';
// import { LikesInfo, LikesInfoSchema } from './likesInfo.schema';
// import { LikeStatus } from '../../likes/domain/like.entity';

// @Schema({ timestamps: true })
// export class Comment {
//   @Prop({ type: String, required: true })
//   content: string;

//   @Prop({ type: String, required: true })
//   postId: string;

//   @Prop({ type: CommentatorInfoSchema, required: true })
//   commentatorInfo: CommentatorInfo;

//   @Prop({ type: LikesInfoSchema, required: true })
//   likesInfo: LikesInfo;

//   createdAt: Date;
//   updatedAt: Date;

//   static createComment(
//     postId: string,
//     userId: string,
//     dto: CommentInputDto,
//     userLogin: string,
//   ) {
//     const comment = new this();
//     comment.content = dto.content;
//     comment.postId = postId;
//     comment.createdAt = new Date();

//     comment.commentatorInfo = {
//       userId,
//       userLogin,
//     };

//     comment.likesInfo = {
//       likesCount: 0,
//       dislikesCount: 0,
//     };

//     return comment as CommentDocument;
//   }

//   updateComment(this: CommentDocument, content: string) {
//     this.content = content;
//   }

//   addLike(this: CommentDocument) {
//     this.likesInfo.likesCount += 1;
//   }

//   addDislike(this: CommentDocument) {
//     this.likesInfo.dislikesCount += 1;
//   }

//   deleteDislike(this: CommentDocument) {
//     this.likesInfo.dislikesCount = Math.max(
//       0,
//       this.likesInfo.dislikesCount - 1,
//     );
//   }

//   deleteLike(this: CommentDocument) {
//     this.likesInfo.likesCount = Math.max(0, this.likesInfo.likesCount - 1);
//   }

//   countNewLike(this: CommentDocument, likeStatus: LikeStatus) {
//     if (likeStatus === LikeStatus.Like) {
//       this.addLike();
//     } else if (likeStatus === LikeStatus.Dislike) {
//       this.addDislike();
//     }
//   }

//   updateCountLikes(
//     this: CommentDocument,
//     newLike: LikeStatus,
//     oldLike: LikeStatus,
//   ) {
//     if (newLike === LikeStatus.Like && oldLike === LikeStatus.Dislike) {
//       this.addLike();
//       this.deleteDislike();
//     } else if (newLike === LikeStatus.Dislike && oldLike === LikeStatus.Like) {
//       this.addDislike();
//       this.deleteLike();
//     } else if (newLike === LikeStatus.None && oldLike === LikeStatus.Like) {
//       this.deleteLike();
//     } else if (newLike === LikeStatus.None && oldLike === LikeStatus.Dislike) {
//       this.deleteDislike();
//     }
//   }
// }

// export const CommentSchema = SchemaFactory.createForClass(Comment);
// CommentSchema.loadClass(Comment);

// export type CommentDocument = HydratedDocument<Comment>;
// export type CommentModelType = Model<CommentDocument> & typeof Comment;
