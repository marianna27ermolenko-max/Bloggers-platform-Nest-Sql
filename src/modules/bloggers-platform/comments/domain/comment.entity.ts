import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  CommentatorInfo,
  CommentatorInfoSchema,
} from './commentatorInfo.schema';
import { HydratedDocument, Model } from 'mongoose';
import { CommentInputDto } from '../api/input-dto/comment.input-dto';
import { LikesInfo, LikesInfoSchema } from './likesInfo.schema';
import { LikeStatus } from '../../likes/domain/like.entity';

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: String, required: true })
  postId: string;

  @Prop({ type: CommentatorInfoSchema, required: true })
  commentatorInfo: CommentatorInfo;

  @Prop({ type: LikesInfoSchema, required: true })
  likesInfo: LikesInfo;

  createdAt: Date;
  updatedAt: Date;

  static createComment(
    postId: string,
    userId: string,
    dto: CommentInputDto,
    userLogin: string,
  ) {
    const comment = new this();
    comment.content = dto.content;
    comment.postId = postId;
    comment.createdAt = new Date();

    comment.commentatorInfo = {
      userId,
      userLogin,
    };

    comment.likesInfo = {
      likesCount: 0,
      dislikesCount: 0,
    };

    return comment as CommentDocument;
  }

  updateComment(this: CommentDocument, content: string) {
    this.content = content;
  }

  addLike(this: CommentDocument) {
    this.likesInfo.likesCount += 1;
  }

  addDislike(this: CommentDocument) {
    this.likesInfo.dislikesCount += 1;
  }

  deleteDislike(this: CommentDocument) {
    this.likesInfo.dislikesCount = Math.max(
      0,
      this.likesInfo.dislikesCount - 1,
    );
  }

  deleteLike(this: CommentDocument) {
    this.likesInfo.likesCount = Math.max(0, this.likesInfo.likesCount - 1);
  }

  countNewLike(this: CommentDocument, likeStatus: LikeStatus) {
    if (likeStatus === LikeStatus.Like) {
      this.addLike();
    } else if (likeStatus === LikeStatus.Dislike) {
      this.addDislike();
    }
  }

  updateCountLikes(
    this: CommentDocument,
    newLike: LikeStatus,
    oldLike: LikeStatus,
  ) {
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

export const CommentSchema = SchemaFactory.createForClass(Comment);
CommentSchema.loadClass(Comment);

export type CommentDocument = HydratedDocument<Comment>;
export type CommentModelType = Model<CommentDocument> & typeof Comment;
