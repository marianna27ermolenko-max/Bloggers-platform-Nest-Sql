export enum PostSortField {
  CreatedAt = 'createdAt',
  BlogName = 'blogName',
  Title = 'title',
  Content = 'content',
}

export const postsSortMap = {
  createdAt: 'p.createdAt',
  title: 'p.title',
  content: 'p.content',
  blogName: 'b.name',
};

export const postsByBlogSortMap = {
  createdAt: 'p.createdAt',
  title: 'p.title',
  shortDescription: 'p.short_description',
  content: 'p.content',
  blogId: 'p.blogId',
};

export const commentsSortMap = {
  createdAt: 'c.createdAt',
  content: 'c.content',
};
