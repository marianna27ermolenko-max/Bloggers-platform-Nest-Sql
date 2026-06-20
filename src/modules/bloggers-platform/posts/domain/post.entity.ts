import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import {
  ExtendedLikesInfo,
  ExtendedLikesInfoSchema,
} from './extendedLikesInfo.schema';
import { PostInputModel } from '../api/input-dto/post.input-dto';
import { LikeStatus } from '../../likes/domain/like.entity';

@Schema({ timestamps: true })
export class Post {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  shortDescription: string;

  @Prop({ type: String, required: true, maxLength: 300 })
  content: string;

  @Prop({ type: String, required: true })
  blogId: string;

  @Prop({ type: String, required: true })
  blogName: string;

  @Prop({ type: ExtendedLikesInfoSchema })
  extendedLikesInfo: ExtendedLikesInfo;

  createdAt: Date;
  updatedAt: Date;

  static createPost(dto: PostInputModel, blogName: string) {
    const post = new this();
    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;
    post.blogId = dto.blogId;
    post.blogName = blogName;
    post.createdAt = new Date();
    post.extendedLikesInfo = {
      likesCount: 0,
      dislikesCount: 0,
    };

    return post as PostDocument;
  }

  updatePost(this: PostDocument, dto: PostInputModel) {
    this.title = dto.title;
    this.content = dto.content;
    this.shortDescription = dto.shortDescription;
    this.blogId = dto.blogId;
  }

  addLike(this: PostDocument) {
    this.extendedLikesInfo.likesCount += 1;
  }

  addDislike(this: PostDocument) {
    this.extendedLikesInfo.dislikesCount += 1;
  }

  deleteDislike(this: PostDocument) {
    this.extendedLikesInfo.dislikesCount = Math.max(
      0,
      this.extendedLikesInfo.dislikesCount - 1,
    );
  }

  deleteLike(this: PostDocument) {
    this.extendedLikesInfo.likesCount = Math.max(
      0,
      this.extendedLikesInfo.likesCount - 1,
    );
  }

  countNewLike(this: PostDocument, likeStatus: LikeStatus) {
    if (likeStatus === LikeStatus.Like) {
      this.addLike();
    } else if (likeStatus === LikeStatus.Dislike) {
      this.addDislike();
    }
  }

  updateCountLikes(
    this: PostDocument,
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

export const PostSchema = SchemaFactory.createForClass(Post);
PostSchema.loadClass(Post);

export type PostDocument = HydratedDocument<Post>;
export type PostModelType = Model<PostDocument> & typeof Post;
