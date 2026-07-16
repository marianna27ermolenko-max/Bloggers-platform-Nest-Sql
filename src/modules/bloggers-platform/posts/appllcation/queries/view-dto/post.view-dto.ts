import { LikeStatus } from 'src/modules/bloggers-platform/likes/domain/like.entity';
import { PostDtoForViewModel } from './post.dto.for.view.model';

// export class PostViewModel {
//   id: string;
//   title: string;
//   shortDescription: string;
//   content: string;
//   blogId: string;
//   blogName: string;
//   createdAt: string;

//   extendedLikesInfo: {
//     likesCount: number;
//     dislikesCount: number;
//     myStatus: LikeStatus;
//     newestLikes: {
//       addedAt: string;
//       userId: string;
//       login: string;
//     }[];
//   };

//   static mapToView(
//     post: PostDocument,
//     myStatus: LikeStatus = LikeStatus.None,
//     newestLikes: {
//       addedAt: string;
//       userId: string;
//       login: string;
//     }[] = [],
//   ): PostViewModel {
//     const viewModel = new PostViewModel();

//     viewModel.id = post._id.toString();
//     viewModel.title = post.title;
//     viewModel.shortDescription = post.shortDescription;
//     viewModel.content = post.content;
//     viewModel.blogId = post.blogId;
//     viewModel.blogName = post.blogName;
//     viewModel.createdAt = post.createdAt.toISOString();

//     viewModel.extendedLikesInfo = {
//       likesCount: post.extendedLikesInfo.likesCount,
//       dislikesCount: post.extendedLikesInfo.dislikesCount,

//       myStatus,
//       newestLikes,
//     };

//     return viewModel;
//   }
// }

export class PostViewModel {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;

  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatus;
    newestLikes: {
      addedAt: string;
      userId: string;
      login: string;
    }[];
  };

  static mapToView(
    post: PostDtoForViewModel,
    myStatus: LikeStatus = LikeStatus.None,
    newestLikes: {
      addedAt: Date;
      userId: number;
      login: string;
    }[] = [],
  ): PostViewModel {
    const viewModel = new PostViewModel();

    viewModel.id = post.id.toString();
    viewModel.title = post.title;
    viewModel.shortDescription = post.shortDescription;
    viewModel.content = post.content;
    viewModel.blogId = post.blogId.toString();
    viewModel.blogName = post.blogName;
    viewModel.createdAt = post.createdAt.toISOString();

    viewModel.extendedLikesInfo = {
      likesCount: post.likesCount,
      dislikesCount: post.dislikesCount,

      myStatus,

      newestLikes: newestLikes.map((like) => ({
        addedAt: like.addedAt.toISOString(),
        userId: like.userId.toString(),
        login: like.login,
      })),
    };

    return viewModel;
  }
}
