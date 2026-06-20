import { BlogDocument } from '../../domain/blog.entity';

export class BlogViewModel {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
  isMembership: boolean;

  static mapToView(this: void, blog: BlogDocument) {
    const mapBlog = new BlogViewModel();

    mapBlog.id = blog.id;
    mapBlog.name = blog.name;
    mapBlog.description = blog.description;
    mapBlog.websiteUrl = blog.websiteUrl;
    mapBlog.createdAt = blog.createdAt;
    mapBlog.isMembership = blog.isMembership;

    return mapBlog;
  }
}
