export class CommentModelDBSql {
  id: string;
  postId: string;
  content: string;
  userId: string;
  userLogin: string;

  likesCount: number;
  dislikesCount: number;

  createdAt: Date;
}
