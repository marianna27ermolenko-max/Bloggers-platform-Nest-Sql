import { CommentDocument } from '../../domain/comment.entity';

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
    comment: CommentDocument,
    myStatus: string = 'None',
  ): CommentViewModel {
    const viewModel = new CommentViewModel();

    viewModel.id = comment._id.toString();
    viewModel.content = comment.content;
    viewModel.createdAt = comment.createdAt.toISOString();

    viewModel.commentatorInfo = {
      userId: comment.commentatorInfo.userId,
      userLogin: comment.commentatorInfo.userLogin,
    };

    viewModel.likesInfo = {
      likesCount: comment.likesInfo.likesCount,
      dislikesCount: comment.likesInfo.dislikesCount,
      myStatus: myStatus,
    };

    return viewModel;
  }
}
