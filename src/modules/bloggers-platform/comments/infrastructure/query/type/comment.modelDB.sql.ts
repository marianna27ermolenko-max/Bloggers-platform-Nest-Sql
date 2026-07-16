export class CommentModelDBSql {
  id: number;
  postId: number;
  content: string;
  userId: number;
  userLogin: string;

  likesCount: number;
  dislikesCount: number;

  createdAt: Date;
}
