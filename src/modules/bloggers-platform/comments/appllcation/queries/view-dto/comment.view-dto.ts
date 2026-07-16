import { LikeStatus } from 'src/modules/bloggers-platform/likes/domain/like.entity';
import { CommentModelDBSql } from '../../../infrastructure/query/type/comment.modelDB.sql';

export class CommentViewModel {
  id: string;
  content: string;
  createdAt: string;

  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: string;
  };

  static mapToView(
    comment: CommentModelDBSql,
    myStatus: LikeStatus,
  ): CommentViewModel {
    const viewModel = new CommentViewModel();

    viewModel.id = comment.id.toString();
    viewModel.content = comment.content;
    viewModel.createdAt = comment.createdAt.toISOString();

    viewModel.commentatorInfo = {
      userId: comment.userId.toString(),
      userLogin: comment.userLogin,
    };

    viewModel.likesInfo = {
      likesCount: comment.likesCount,
      dislikesCount: comment.dislikesCount,
      myStatus: myStatus,
    };

    return viewModel;
  }
}
