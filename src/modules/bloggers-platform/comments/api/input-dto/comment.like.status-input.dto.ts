import { IsEnum, IsNotEmpty } from 'class-validator';
import { LikeStatus } from 'src/modules/bloggers-platform/likes/domain/like.entity';

export class LikeInputModel {
  @IsNotEmpty()
  @IsEnum(LikeStatus)
  likeStatus: LikeStatus;
}
