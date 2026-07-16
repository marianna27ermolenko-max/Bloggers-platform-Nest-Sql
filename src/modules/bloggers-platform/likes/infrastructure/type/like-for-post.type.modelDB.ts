import { LikeStatus } from '../../domain/like.entity';

export class LikePostModelDB {
  id: number;
  postId: number;
  userId: number;
  likeStatus: LikeStatus;
  createdAt: Date;
}
