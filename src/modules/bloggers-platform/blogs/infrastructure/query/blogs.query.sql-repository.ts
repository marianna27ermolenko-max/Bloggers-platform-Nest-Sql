import { Injectable } from '@nestjs/common';
import { GetBlogsQueryParams } from '../../api/input-dto/get-blogs-query-params.input-dto';
import { BlogViewModelSql } from '../../appllcation/queries/view-dto/blog.view-dto';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CountResult } from 'src/modules/user-accounts/user/infrastructure/query/type/type.totalCount';
import { BlogSortBy } from '../../api/input-dto/blogs-sort-by';
import { BlogModelBD } from '../../appllcation/queries/view-dto/blog.model.BD';

@Injectable()
export class BlogsQwSqlRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getAll(
    query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewModelSql[]>> {
    const { sortBy, searchNameTerm, pageNumber, pageSize } = query;

    const orderBy = sortBy === BlogSortBy.CreatedAt ? 'created_at' : 'name';

    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    const sortDirection = query.sortDirection === 'desc' ? 'DESC' : 'ASC';

    const blogs: BlogModelBD[] = await this.dataSource.query(
      ` SELECT 
         id, 
         name, 
         description, 
         website_url AS "websiteUrl", 
         created_at AS  "createdAt",
         is_membership AS "isMembership"
        FROM blogs
        WHERE name ILIKE $1
        ORDER BY ${orderBy} ${sortDirection}
        LIMIT $2
        OFFSET $3
        `,
      [`%${searchNameTerm ?? ''}%`, pageSize, query.calculateSkip()],
    );

    const items = blogs.map((blog) => BlogViewModelSql.mapToView(blog));

    const count: CountResult[] = await this.dataSource.query(
      ` SELECT COUNT(*) AS "totalCount"
        FROM blogs
        WHERE name ILIKE $1`,
      [`%${searchNameTerm ?? ''}%`],
    );

    const totalCount = Number(count[0].totalCount);

    return PaginatedViewDto.mapToView({
      items,
      page: pageNumber,
      size: pageSize,
      totalCount,
    });
  }

  async getByIdOrNotFoundFail(id: number): Promise<BlogViewModelSql> {
    const blogs: BlogModelBD[] = await this.dataSource.query(
      ` SELECT  id, 
         name, 
         description, 
         website_url AS "websiteUrl", 
         created_at AS  "createdAt",
         is_membership AS "isMembership"
        FROM blogs 
        WHERE id = $1`,
      [id],
    );

    const blog = blogs[0];

    if (!blog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'blog not found',
      });
    }
    return BlogViewModelSql.mapToView(blog);
  }
}
