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

@Unique(['userId', 'postId'])
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

// @Schema({ timestamps: true })
// export class Like {
//   @Prop({ type: String, required: true })
//   userId: string;

//   @Prop({ type: String, required: false })
//   login: string;

//   @Prop({ type: String, required: true })
//   parentId: string;

//   @Prop({ enum: ParentType, required: true })
//   parentType: ParentType;

//   @Prop({ enum: LikeStatus, required: true })
//   likeStatus: LikeStatus;

//   createdAt: Date;
//   updatedAt: Date;

//   static createLike(
//     userId: string,
//     parentId: string,
//     parentType: ParentType,
//     likeStatus: LikeStatus,
//     login: string,
//   ) {
//     const like = new this();
//     like.userId = userId;
//     like.parentId = parentId;
//     like.parentType = parentType;
//     like.likeStatus = likeStatus;
//     like.login = login;

//     return like as LikeDocument;
//   }

//   updateStatus(this: LikeDocument, likeStatus: LikeStatus) {
//     this.likeStatus = likeStatus;
//   }
// }

// export const LikeSchema = SchemaFactory.createForClass(Like);
// LikeSchema.loadClass(Like);

// LikeSchema.index({ userId: 1, parentId: 1, parentType: 1 }, { unique: true });

// export type LikeDocument = HydratedDocument<Like>;
// export type LikeModelType = Model<LikeDocument> & typeof Like;
