import { LikeStatus } from 'src/modules/bloggers-platform/likes/domain/like.entity';
import { PostDocument } from 'src/modules/bloggers-platform/posts/domain/post.entity';

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
    post: PostDocument,
    myStatus: LikeStatus = LikeStatus.None,
    newestLikes: {
      addedAt: string;
      userId: string;
      login: string;
    }[] = [],
  ): PostViewModel {
    const viewModel = new PostViewModel();

    viewModel.id = post._id.toString();
    viewModel.title = post.title;
    viewModel.shortDescription = post.shortDescription;
    viewModel.content = post.content;
    viewModel.blogId = post.blogId;
    viewModel.blogName = post.blogName;
    viewModel.createdAt = post.createdAt.toISOString();

    viewModel.extendedLikesInfo = {
      likesCount: post.extendedLikesInfo.likesCount,
      dislikesCount: post.extendedLikesInfo.dislikesCount,

      myStatus,
      newestLikes,
    };

    return viewModel;
  }
}

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
