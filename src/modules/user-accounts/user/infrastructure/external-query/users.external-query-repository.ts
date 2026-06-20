import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { UserModelType } from '../../domain/user.entity';
import { UserViewDtoAdmin } from '../../api/view-dto/users.view-dto';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { User } from '../../domain/user.entity';

@Injectable()
export class UsersExternalQueryRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async getByIdOrNotFoundFail(id: string): Promise<UserViewDtoAdmin> {
    const user = await this.UserModel.findOne({ _id: id, deletedAt: null });
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'user not found',
      });
    }
    return UserViewDtoAdmin.mapToView(user);
  }
}
