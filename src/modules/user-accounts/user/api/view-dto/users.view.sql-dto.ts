import { UserDbSqlViewModel } from '../../infrastructure/query/type/type.user';

export class UserViewSqlDtoAdmin {
  id: string;
  login: string;
  email: string;
  createdAt: string | Date;
  // firstName: string;
  // lastName: string | null;

  static mapToView(user: UserDbSqlViewModel): UserViewSqlDtoAdmin {
    const mapUser = new UserViewSqlDtoAdmin();

    mapUser.email = user.email;
    mapUser.login = user.login;
    mapUser.id = user.id.toString();
    mapUser.createdAt = user.createdAt;
    // mapUser.firstName = user.name.firstName;
    // mapUser.lastName = user.name.lastName;

    return mapUser;
  }
}

export class UserLocalDto {
  id: number;
  login: string;
  email: string;
  createdAt: string | Date;
  passwordHash: string;
  // firstName: string;
  // lastName: string | null;

  static mapToView(user: UserLocalDto): UserLocalDto {
    const mapUser = new UserLocalDto();

    mapUser.email = user.email;
    mapUser.login = user.login;
    mapUser.id = user.id;
    mapUser.createdAt = user.createdAt;
    mapUser.passwordHash = user.passwordHash;
    // mapUser.firstName = user.name.firstName;
    // mapUser.lastName = user.name.lastName;

    return mapUser;
  }
}
