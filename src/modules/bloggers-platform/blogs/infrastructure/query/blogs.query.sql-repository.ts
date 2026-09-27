import { Injectable } from '@nestjs/common';
import { GetBlogsQueryParams } from '../../api/input-dto/get-blogs-query-params.input-dto';
import { BlogViewModelSql } from '../../appllcation/queries/view-dto/blog.view-dto';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
// import { CountResult } from 'src/modules/user-accounts/user/infrastructure/query/type/type.totalCount';
import { BlogSortBy } from '../../api/input-dto/blogs-sort-by';
// import { BlogModelBD } from '../../appllcation/queries/view-dto/blog.model.BD';
import { Blog } from '../../domain/blog.entity';
import { SortDirection } from 'src/core/dto/base.query-params.input-dto';

@Injectable()
export class BlogsQwRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Blog) private blogRepository: Repository<Blog>,
  ) {}

  async getAll(
    query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewModelSql[]>> {
    const { sortBy, searchNameTerm, pageNumber, pageSize } = query;

    // const orderBy =
    //   sortBy === BlogSortBy.CreatedAt ? 'createdAt' : 'name';

    const sortDirection =
      query.sortDirection === SortDirection.Desc ? 'DESC' : 'ASC';

    const qb = this.blogRepository.createQueryBuilder('b');

    if (searchNameTerm) {
      qb.where('b.name ILIKE :name', { name: `%${searchNameTerm}%` });
    }

    if (sortBy === BlogSortBy.CreatedAt) {
      qb.orderBy('b.createdAt', sortDirection);
    } else {
      qb.orderBy('b.name COLLATE "C"', sortDirection);
    }

    const [blogs, totalCount] = await qb
      // .orderBy(`b.${orderBy}`, sortDirection)
      .skip((pageNumber - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    const items = blogs.map((blog) => BlogViewModelSql.mapToView(blog));

    return PaginatedViewDto.mapToView({
      items,
      page: pageNumber,
      size: pageSize,
      totalCount,
    });
  }

  async getByIdOrNotFoundFail(id: string): Promise<BlogViewModelSql> {
    const blog = await this.blogRepository
      .createQueryBuilder()
      .where('id = :id', { id })
      .getOne();

    if (!blog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'blog not found',
      });
    }
    return BlogViewModelSql.mapToView(blog);
  }
}
