import { BlogDocument } from '../../../domain/blog.entity';
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

    mapBlog.id = blog.id.toString();
    mapBlog.name = blog.name;
    mapBlog.description = blog.description;
    mapBlog.websiteUrl = blog.websiteUrl;
    mapBlog.createdAt = blog.createdAt.toISOString();
    mapBlog.isMembership = blog.isMembership;

    return mapBlog;
  }
}

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
