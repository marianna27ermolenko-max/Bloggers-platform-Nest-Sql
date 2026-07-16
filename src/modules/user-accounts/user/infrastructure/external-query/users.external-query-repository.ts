import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { UserModelType } from '../../domain/user.entity';
import { UserViewDtoAdmin } from '../../api/view-dto/users.view-dto';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { User } from '../../domain/user.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserDbSqlViewModel } from '../query/type/type.user';

@Injectable()
export class UsersExternalQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getByIdOrNotFoundFail(id: number): Promise<UserViewDtoAdmin> {
    const users: UserDbSqlViewModel[] = await this.dataSource.query(
      `SELECT id, login, email, created_at AS "createdAt" 
          FROM users WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    );

    const user = users[0];

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'user not found',
      });
    }
    return UserViewDtoAdmin.mapToView(user);
  }
}
