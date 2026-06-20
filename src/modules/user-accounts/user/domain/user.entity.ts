import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { Name, NameSchema } from './name.schema';
import {
  DomainException,
  Extension,
} from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { CreateUserDomainDto, UpdateUserDto } from '../dto/create-user.dto';

export const loginConstraints = {
  minLength: 3,
  maxLength: 10,
};

export const passwordConstraints = {
  minLength: 6,
  maxLength: 20,
};

export const emailConstraints = {
  match: /^[\w.+-]+@([\w-]+\.)+[\w-]{2,4}$/,
};

@Schema({ timestamps: true }) //флаг timestemp автоматичеки добавляет поля upatedAt и createdAt
export class User {
  @Prop({
    type: String,
    required: true,
    minlength: 3,
    maxlength: 10,
    unique: true,
    ...loginConstraints,
  })
  login: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
    ...emailConstraints,
  })
  email: string;

  @Prop({ type: String, required: true })
  passwordHash: string;

  // @Prop({ type: Boolean, required: true, default: false })
  // isEmailConfirmed: boolean;

  @Prop({
    type: {
      confirmationCode: String,
      expirationDate: Date,
      isConfirmed: Boolean,
    },
    default: {
      confirmationCode: null,
      expirationDate: null,
      isConfirmed: false,
    },
  })
  emailConfirmation: {
    confirmationCode: string | null;
    expirationDate: Date | null;
    isConfirmed: boolean;
  };

  @Prop({
    type: {
      confirmationCode: String,
      expirationDate: Date,
    },
    default: {
      confirmationCode: null,
      expirationDate: null,
    },
  })
  recoveryCode: {
    confirmationCode: string | null;
    expirationDate: Date | null;
  };

  @Prop({ type: NameSchema })
  name: Name;

  createdAt: Date;
  updatedAt: Date;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  static createInstance(dto: CreateUserDomainDto): UserDocument {
    const user = new this();
    user.email = dto.email;
    user.passwordHash = dto.passwordHash;
    user.login = dto.login;
    user.emailConfirmation = {
      confirmationCode: dto.confirmationCode ?? null,
      expirationDate: dto.expirationDate ?? null,
      isConfirmed: false,
    };
    user.recoveryCode = {
      confirmationCode: null,
      expirationDate: null,
    };

    user.name = {
      firstName: 'firstName xxx',
      lastName: 'lastName yyy',
    };

    return user as UserDocument;
  }

  static createInstanceAdmin(dto: CreateUserDomainDto): UserDocument {
    const user = new this();
    user.email = dto.email;
    user.passwordHash = dto.passwordHash;
    user.login = dto.login;
    user.emailConfirmation = {
      confirmationCode: null,
      expirationDate: null,
      isConfirmed: true,
    };

    user.recoveryCode = {
      confirmationCode: null,
      expirationDate: null,
    };

    user.name = {
      firstName: 'firstName xxx',
      lastName: 'lastName yyy',
    };

    return user as UserDocument;
  }

  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Entity already deleted',
        extensions: [new Extension('Entity already deleted', 'User')],
      });
    }
    this.deletedAt = new Date();
  }

  update(dto: UpdateUserDto) {
    if (dto.email !== this.email) {
      this.emailConfirmation.isConfirmed = false;
    }
    this.email = dto.email;
  }

  confirmEmail(this: UserDocument) {
    if (this.emailConfirmation.isConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Validation failed',
        extensions: [new Extension('Email already confirmed', 'code')],
      });
    }

    if (
      !this.emailConfirmation.expirationDate ||
      this.emailConfirmation.expirationDate < new Date()
    ) {
      throw new DomainException({
        code: DomainExceptionCode.ConfirmationCodeExpired,
        message: 'Validation failed',
        extensions: [new Extension('Code expired', 'code')],
      });
    }

    this.emailConfirmation.isConfirmed = true;
    this.emailConfirmation.confirmationCode = null;
    this.emailConfirmation.expirationDate = null;
  }

  confirmEmailResending(
    this: UserDocument,
    code: string,
    expirationDate: Date,
  ) {
    if (this.emailConfirmation.isConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Validation failed',
        extensions: [new Extension('Email already confirmed', 'email')],
      });
    }

    this.emailConfirmation.confirmationCode = code;
    this.emailConfirmation.expirationDate = expirationDate;
  }

  passwordRecovery(this: UserDocument, code: string, expirationDate: Date) {
    this.recoveryCode.confirmationCode = code;
    this.recoveryCode.expirationDate = expirationDate;
  }

  updatePassword(this: UserDocument, passwordHash: string) {
    if (
      !this.recoveryCode?.expirationDate ||
      this.recoveryCode.expirationDate < new Date()
    ) {
      throw new DomainException({
        code: DomainExceptionCode.PasswordRecoveryCodeExpired,
        message: 'Code expired',
        extensions: [new Extension('Code already confirmed', 'code')],
      });
    }
    this.passwordHash = passwordHash;
    this.recoveryCode.confirmationCode = null;
    this.recoveryCode.expirationDate = null;
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

//регистрируем методы сущности в схеме
UserSchema.loadClass(User);

export type UserDocument = HydratedDocument<User>;
export type UserModelType = Model<UserDocument> & typeof User;
