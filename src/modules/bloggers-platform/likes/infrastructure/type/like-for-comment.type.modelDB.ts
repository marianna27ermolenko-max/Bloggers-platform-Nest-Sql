import { LikeStatus } from '../../domain/like.post.entity';

export class LikeCommentModelDB {
  id: string;
  commentId: string;
  userId: string;
  likeStatus: LikeStatus;
  createdAt: Date;
}
