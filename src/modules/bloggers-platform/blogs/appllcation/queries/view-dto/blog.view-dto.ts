// import { BlogDocument } from '../../../domain/blog.entity';
import { BlogModelBD } from './blog.model.BD';

export class BlogViewModelSql {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;

  static mapToView(blog: BlogModelBD): BlogViewModelSql {
    const mapBlog = new BlogViewModelSql();

    mapBlog.id = blog.id;
    mapBlog.name = blog.name;
    mapBlog.description = blog.description;
    mapBlog.websiteUrl = blog.websiteUrl;
    mapBlog.createdAt = blog.createdAt.toISOString();
    mapBlog.isMembership = blog.isMembership;

    return mapBlog;
  }
}
