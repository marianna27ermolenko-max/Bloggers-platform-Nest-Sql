import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, type UserModelType } from '../domain/user.entity';

import {
  DomainException,
  Extension,
} from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async findById(id: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      _id: id,
      deletedAt: null,
    });
  }

  async save(user: UserDocument) {
    await user.save();
  }

  async findOrNotFoundFail(id: string): Promise<UserDocument> {
    const user = await this.findById(id);
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'user not found',
      });
    }

    return user;
  }

  async findByLoginOrEmail(loginOrEmail: string): Promise<UserDocument | null> {
    const user = await this.UserModel.findOne({
      $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
    });

    return user;
  }

  async findForCode(code: string): Promise<UserDocument> {
    const user = await this.UserModel.findOne({
      'emailConfirmation.confirmationCode': code,
    });

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.ValidationError,
        message: 'Validation failed',
        extensions: [new Extension('Invalid code', 'code')],
      });
    }

    return user;
  }

  async findForRecoveryCode(
    recoveryCode: string,
  ): Promise<UserDocument | null> {
    const user = await this.UserModel.findOne({
      'recoveryCode.confirmationCode': recoveryCode,
    });

    if (!user) {
      return null;
    }

    return user;
  }
}
