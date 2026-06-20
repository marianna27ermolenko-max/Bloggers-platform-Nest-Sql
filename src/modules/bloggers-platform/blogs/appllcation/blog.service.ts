import { InjectModel } from '@nestjs/mongoose';
import { Blog, type BlogModelType } from '../domain/blog.entity';
import { BlogInputModel } from '../dto/create.blog-dto';
import { BlogsRepository } from '../infrastructure/blog.repository';
import { UpdateBlogDto } from '../dto/update.blog-dto';

export class BlogsService {
  constructor(
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    private blogsRepository: BlogsRepository,
  ) {}

  async createBlog(dto: BlogInputModel): Promise<string> {
    const blog = this.BlogModel.createBlog(dto);
    await this.blogsRepository.save(blog);
    return blog._id.toString();
  }

  async updateBlog(id: string, dto: UpdateBlogDto): Promise<void> {
    const blog = await this.blogsRepository.getByIdOrNotFoundFail(id);
    blog.updateBlog(dto);
    await this.blogsRepository.save(blog);
  }

  async deleteBlog(id: string): Promise<void> {
    await this.blogsRepository.getByIdOrNotFoundFail(id);
    await this.blogsRepository.deleteBlog(id);
  }
}
