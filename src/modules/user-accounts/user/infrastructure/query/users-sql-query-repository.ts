import { Injectable } from '@nestjs/common';
import { GetUsersQueryParams } from '../../api/input-dto/get-users-query-params.input-dto';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { UserDbSqlViewModel } from './type/type.user';
import { CountResult } from './type/type.totalCount';
import { UserViewSqlDtoAdmin } from '../../api/view-dto/users.view.sql-dto';
import { usersSortMap } from '../../api/input-dto/users-sort-by';

@Injectable()
export class UsersSqlQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async getUsers(
    query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewSqlDtoAdmin[]>> {
    const sortColumn = usersSortMap[query.sortBy];

    const orderBy =
      sortColumn === 'login' || sortColumn === 'email'
        ? `"${sortColumn}" COLLATE "C"`
        : sortColumn;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    const sortDirection = query.sortDirection === 'desc' ? 'DESC' : 'ASC';

    const users: UserDbSqlViewModel[] = await this.dataSource.query(
      `SELECT id, login, email, created_at AS "createdAt"
      FROM users  
      WHERE (login ILIKE $1 OR email ILIKE $2) 
      AND deleted_at IS NULL
      ORDER BY ${orderBy} ${sortDirection}
      LIMIT $3
      OFFSET $4`,
      [
        `%${query.searchLoginTerm ?? ''}%`,
        `%${query.searchEmailTerm ?? ''}%`,
        query.pageSize,
        query.calculateSkip(),
      ],
    );

    const count: CountResult[] = await this.dataSource.query(
      'SELECT COUNT(*) as "totalCount" FROM users WHERE login ILIKE $1 OR email ILIKE $2',
      [`%${query.searchLoginTerm ?? ''}%`, `%${query.searchEmailTerm ?? ''}%`],
    );

    const totalCount = Number(count[0].totalCount);

    const items = users.map((user) => UserViewSqlDtoAdmin.mapToView(user));

    return PaginatedViewDto.mapToView({
      items,
      page: query.pageNumber,
      size: query.pageSize,
      totalCount,
    });
  }

  async getByIdOrNotFoundFail(id: number): Promise<UserViewSqlDtoAdmin> {
    const users: UserDbSqlViewModel[] = await this.dataSource.query(
      'SELECT id, login, email, created_at  AS "createdAt" FROM users WHERE id = $1',
      [id],
    );

    const user = users[0];

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'user not found',
      });
    }

    return UserViewSqlDtoAdmin.mapToView(user);
  }

  async getMeInfo(userId: number): Promise<UserViewSqlDtoAdmin> {
    const users: UserDbSqlViewModel[] = await this.dataSource.query(
      'SELECT id, login, email, created_at AS "createdAt" FROM users WHERE id = $1',
      [userId],
    );

    const user = users[0];

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'user is unauthorized',
      });
    }

    return UserViewSqlDtoAdmin.mapToView(user);
  }
}
