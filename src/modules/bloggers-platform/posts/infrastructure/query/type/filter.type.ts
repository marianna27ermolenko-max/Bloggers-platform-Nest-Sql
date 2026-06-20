export type PostsFilter = {
  blogId?: string;
  $or?: Array<Record<string, any>>;
};
