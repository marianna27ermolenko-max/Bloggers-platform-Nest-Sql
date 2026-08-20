import { UserDbSqlViewModel } from '../../infrastructure/query/type/type.user';

export class UserViewSqlDtoAdmin {
  id: string;
  login: string;
  email: string;
  createdAt: string | Date;

  static mapToView(user: UserDbSqlViewModel): UserViewSqlDtoAdmin {
    const mapUser = new UserViewSqlDtoAdmin();

    mapUser.email = user.email;
    mapUser.login = user.login;
    mapUser.id = user.id;
    mapUser.createdAt = user.createdAt;

    return mapUser;
  }
}

export class UserLocalDto {
  id: string;
  login: string;
  email: string;
  createdAt: string | Date;
  passwordHash: string;

  static mapToView(user: UserLocalDto): UserLocalDto {
    const mapUser = new UserLocalDto();

    mapUser.email = user.email;
    mapUser.login = user.login;
    mapUser.id = user.id;
    mapUser.createdAt = user.createdAt;
    mapUser.passwordHash = user.passwordHash;

    return mapUser;
  }
}
