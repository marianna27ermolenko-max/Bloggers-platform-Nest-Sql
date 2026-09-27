import { UserDbSqlViewModel } from 'src/modules/user-accounts/user/infrastructure/query/type/type.user';

export class MeViewDto {
  email: string;
  login: string;
  userId: string;

  static mapToView(user: UserDbSqlViewModel): MeViewDto {
    return {
      email: user.email,
      login: user.login,
      userId: user.id.toString(),
    };
  }
}
