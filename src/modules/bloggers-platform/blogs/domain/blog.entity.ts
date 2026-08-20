import { BaseDBEntity } from '../../../../core/BaseDBEntity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Post } from '../../posts/domain/post.entity';

@Entity()
export class Blog extends BaseDBEntity {
  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', length: 500 })
  description: string;

  @Column({ type: 'varchar', length: 100 })
  websiteUrl: string;

  @Column({ type: 'boolean', default: false })
  isMembership: boolean;

  @OneToMany(() => Post, (post) => post.blog)
  posts: Post[];

  static createBlog(
    name: string,
    description: string,
    websiteUrl: string,
  ): Blog {
    const blog = new Blog();
    blog.name = name;
    blog.description = description;
    blog.websiteUrl = websiteUrl;

    return blog;
  }

  updateBlog(name: string, description: string, websiteUrl: string) {
    this.name = name;
    this.description = description;
    this.websiteUrl = websiteUrl;
  }
}
