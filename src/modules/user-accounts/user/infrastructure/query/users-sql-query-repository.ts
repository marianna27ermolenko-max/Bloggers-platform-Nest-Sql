import { Injectable } from '@nestjs/common';
import { GetUsersQueryParams } from '../../api/input-dto/get-users-query-params.input-dto';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { DataSource, ILike, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { UserViewSqlDtoAdmin } from '../../api/view-dto/users.view.sql-dto';
import { usersSortMap } from '../../api/input-dto/users-sort-by';
import { User } from '../../domain/user.entity';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async getUsers(
    query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewSqlDtoAdmin[]>> {
    const sortColumn = usersSortMap[query.sortBy];

    // const orderBy =
    //   sortColumn === 'login' || sortColumn === 'email'
    //     ? `"${sortColumn}" COLLATE "C"`
    //     : sortColumn;

    const sortDirection: 'ASC' | 'DESC' =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
      query.sortDirection === 'desc' ? 'DESC' : 'ASC';

    const filter = [
      { login: ILike(`%${query.searchLoginTerm ?? ''}%`) },
      { email: ILike(`%${query.searchEmailTerm ?? ''}%`) },
    ];

    const users = await this.userRepository.find({
      where: filter,
      order: {
        [sortColumn]: sortDirection,
      },
      take: query.pageSize, // LIMIT
      skip: query.calculateSkip(), // OFFSET
    });

    const totalCount = await this.userRepository.count({
      where: filter,
    });

    const items = users.map((user) => UserViewSqlDtoAdmin.mapToView(user));

    return PaginatedViewDto.mapToView({
      items,
      page: query.pageNumber,
      size: query.pageSize,
      totalCount,
    });
  }

  async getByIdOrNotFoundFail(id: string): Promise<UserViewSqlDtoAdmin> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'user not found',
      });
    }

    return UserViewSqlDtoAdmin.mapToView(user);
  }

  // async getMeInfo(userId: number): Promise<UserViewSqlDtoAdmin> {
  //   const users: UserDbSqlViewModel[] = await this.dataSource.query(
  //     'SELECT id, login, email, created_at AS "createdAt" FROM users WHERE id = $1',
  //     [userId],
  //   );

  //   const user = users[0];

  //   if (!user) {
  //     throw new DomainException({
  //       code: DomainExceptionCode.Unauthorized,
  //       message: 'user is unauthorized',
  //     });
  //   }

  //   return UserViewSqlDtoAdmin.mapToView(user);
  // }
}
