import { InjectModel } from '@nestjs/mongoose';
import { Post, type PostModelType } from '../domain/post.entity';
import { PostInputModel } from '../api/input-dto/post.input-dto';
import { BlogsRepository } from '../../blogs/infrastructure/blog.repository';
import { PostsRepository } from '../infrastructure/post.repository';
import { PostInputDtoByBlog } from '../../blogs/api/input-dto/post-ByBlog-input.dto';

export class PostsService {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    private postsRepository: PostsRepository,
    // private usersQwRepository: UsersQwRepository,
    // private usersRepository: UsersRepository,
    private blogsRepository: BlogsRepository,
  ) {}

  async createPost(dto: PostInputModel): Promise<string> {
    const blog = await this.blogsRepository.getByIdOrNotFoundFail(dto.blogId);
    const post = this.PostModel.createPost(dto, blog.name);
    await this.postsRepository.save(post);

    return post._id.toString();
  }

  // async createPostByBlogId(
  //   blogId: string,
  //   dto: PostInputDtoByBlog,
  // ): Promise<string> {
  //   const blog = await this.blogsRepository.getByIdOrNotFoundFail(blogId);

  //   const post = this.PostModel.createPost(
  //     {
  //       content: dto.content,
  //       shortDescription: dto.shortDescription,
  //       title: dto.title,
  //       blogId,
  //     },
  //     blog.name,
  //   );
  //   await this.postsRepository.save(post);

  //   return post._id.toString();
  // }

  async updatePost(id: string, dto: PostInputModel) {
    const post = await this.postsRepository.getByIdOrNotFoundFail(id);
    post.updatePost(dto);
    await this.postsRepository.save(post);
  }

  async deletePost(id: string): Promise<void> {
    await this.postsRepository.getByIdOrNotFoundFail(id);
    await this.postsRepository.deletePost(id);
  }
}
