import { UserDocument } from 'src/modules/user-accounts/user/domain/user.entity';

export class UserViewDto {
  email: string;
  login: string;
  userId: string;

  static mapToView(user: UserDocument): UserViewDto {
    const mapUser = new UserViewDto();

    mapUser.email = user.email;
    mapUser.login = user.login;
    mapUser.userId = user._id.toString();

    return mapUser;
  }
}

export class MeViewDto {
  email: string;
  login: string;
  userId: string;

  static mapToView(user: UserDocument): MeViewDto {
    return {
      email: user.email,
      login: user.login,
      userId: user._id.toString(),
    };
  }
}
