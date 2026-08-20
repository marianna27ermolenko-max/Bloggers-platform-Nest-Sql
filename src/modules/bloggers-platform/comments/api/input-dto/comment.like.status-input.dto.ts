import { IsEnum, IsNotEmpty } from 'class-validator';
import { LikeStatus } from 'src/modules/bloggers-platform/likes/domain/like.post.entity';

export class LikeInputModel {
  @IsNotEmpty()
  @IsEnum(LikeStatus)
  likeStatus: LikeStatus;
}
