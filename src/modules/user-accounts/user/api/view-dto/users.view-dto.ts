import { UserDbSqlViewModel } from '../../infrastructure/query/type/type.user';

export class UserViewDtoAdmin {
  id: string;
  login: string;
  email: string;
  createdAt: string;
  // firstName: string;
  // lastName: string | null;

  static mapToView(user: UserDbSqlViewModel): UserViewDtoAdmin {
    const mapUser = new UserViewDtoAdmin();

    mapUser.email = user.email;
    mapUser.login = user.login;
    mapUser.id = user.id.toString();
    mapUser.createdAt = user.createdAt.toISOString();
    // mapUser.firstName = user.name.firstName;
    // mapUser.lastName = user.name.lastName;

    return mapUser;
  }
}
