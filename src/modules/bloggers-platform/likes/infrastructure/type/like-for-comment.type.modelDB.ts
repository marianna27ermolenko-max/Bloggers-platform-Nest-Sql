import { LikeStatus } from '../../domain/like.entity';

export class LikeCommentModelDB {
  id: number;
  commentId: number;
  userId: number;
  likeStatus: LikeStatus;
  createdAt: Date;
}
