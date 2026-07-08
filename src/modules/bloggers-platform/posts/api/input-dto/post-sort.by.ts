export enum PostSortField {
  CreatedAt = 'createdAt',
  BlogName = 'blogName',
  Title = 'title',
  Content = 'content',
}

export const postsSortMap = {
  createdAt: 'p.created_at',
  title: 'p.title',
  content: 'p.content',
  blogName: 'b.name',
};

export const postsByBlogSortMap = {
  createdAt: 'p.created_at',
  title: 'p.title',
  shortDescription: 'p.short_description',
  content: 'p.content',
  blogId: 'p.blog_id',
};
