import { LikeStatus } from 'src/modules/bloggers-platform/likes/domain/like.post.entity';
import { Comment } from '../../../domain/comment.entity';

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

  static mapToView(comment: Comment, myStatus: LikeStatus): CommentViewModel {
    const viewModel = new CommentViewModel();

    viewModel.id = comment.id;
    viewModel.content = comment.content;
    viewModel.createdAt = comment.createdAt.toISOString();

    viewModel.commentatorInfo = {
      userId: comment.userId,
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
