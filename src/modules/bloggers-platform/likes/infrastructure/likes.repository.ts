import { InjectModel } from '@nestjs/mongoose';
import {
  Like,
  LikeDocument,
  ParentType,
  type LikeModelType,
} from '../domain/like.entity';

export class LikesRepository {
  constructor(@InjectModel(Like.name) private LikeModel: LikeModelType) {}

  async save(like: LikeDocument): Promise<void> {
    await like.save();
  }

  async findLike(
    userId: string,
    parentId: string,
    parentType: ParentType,
  ): Promise<LikeDocument | null> {
    return this.LikeModel.findOne({
      userId,
      parentId,
      parentType,
    });
  }

  async delete(id: string): Promise<void> {
    await this.LikeModel.deleteOne({ _id: id });
  }

  async findLikesByParentIds(
    userId: string,
    parentIds: string[],
    parentType: ParentType,
  ): Promise<LikeDocument[]> {
    return this.LikeModel.find({
      userId,
      parentType,
      parentId: { $in: parentIds },
    });
  }
}
