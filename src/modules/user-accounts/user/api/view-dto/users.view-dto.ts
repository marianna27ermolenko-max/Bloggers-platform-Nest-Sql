import { UserDocument } from '../../domain/user.entity';

export class UserViewDtoAdmin {
  id: string;
  login: string;
  email: string;
  createdAt: Date;
  // firstName: string;
  // lastName: string | null;

  static mapToView(this: void, user: UserDocument): UserViewDtoAdmin {
    const mapUser = new UserViewDtoAdmin();

    mapUser.email = user.email;
    mapUser.login = user.login;
    mapUser.id = user._id.toString();
    mapUser.createdAt = user.createdAt;
    // mapUser.firstName = user.name.firstName;
    // mapUser.lastName = user.name.lastName;

    return mapUser;
  }
}
