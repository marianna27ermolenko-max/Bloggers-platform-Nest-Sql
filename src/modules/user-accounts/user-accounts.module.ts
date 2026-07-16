import { Module } from '@nestjs/common';
import { UsersService } from './user/application/user-service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user/domain/user.entity';
import { UsersRepository } from './user/infrastructure/users.repository';
import { UsersExternalQueryRepository } from './user/infrastructure/external-query/users.external-query-repository';
import { BcryptService } from './auth/application/bcrypt.service';
import { AuthService } from './auth/application/auth.service';
import { AuthQwRepository } from './auth/infrastructure/auth.query-repository';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { NotificationsModule } from '../notifications/notifications.module';
import { PassportModule } from '@nestjs/passport';
import { BasicAuthGuard } from './guard/basic/basic-auth.guard';
import { JwtRefreshAuthGuard } from './guard/bearer/jwt.refresh-auth.guard';
import { LocalAuthGuard } from './guard/local/local-auth.guard';
import { LocalStrategy } from './guard/local/local.strategy';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from './constants/auth-tokens.inject-constants';
import { SecurityDevicesController } from './session-devices-security/api/security-devices.controller';
import { LoginUserCommandHandler } from './auth/application/usecases/login-user.usecase';
import { JwtRefreshStrategy } from './guard/bearer/jwt.strategy.refresh';
import { UserAccountsConfig } from './config/user-accounts.config';
import { AuthController } from './auth/api/auth.controller';
import { UsersController } from './user/api/user-controller';
import { SessionsRepository } from './session-devices-security/infrastructure/session-devices.repo';
import { SessionsQwRepository } from './session-devices-security/infrastructure/session-devices.qw.repo';
import { JwtAccessStrategy } from './guard/bearer/jwt.strategy.access';
import { JwtAccessAuthGuard } from './guard/bearer/jwt.access-auth.guard';
import {
  Session,
  SessionSchema,
} from './session-devices-security/domain/session.entity';
import { UpdateRefreshTokenHandler } from './auth/application/usecases/refresh-token.usecases';
import { GetDevicesQueryHandler } from './session-devices-security/application/query/get-devices-query';
import { DeleteDevicesCommandHandler } from './session-devices-security/application/usecases/delete-devices-usecases';
import { DeleteDeviceByIdCommandHandler } from './session-devices-security/application/usecases/delete-device-byId';
import { LogoutCommandHandler } from './auth/application/usecases/logout-usecases';
import { UsersSqlQueryRepository } from './user/infrastructure/query/users-sql-query-repository';
import { UsersSqlRepository } from './user/infrastructure/users.sql.repository';
import { CreateUserCommandHandler } from './user/application/usecases/create-user.usecase';
import { DeleteCommandHandler } from './user/application/usecases/delete-user.usecase';
import { SessionsSqlRepository } from './session-devices-security/infrastructure/session-devices.sql.repo';
import { SessionsQwSqlRepository } from './session-devices-security/infrastructure/session-devices.qw.sql.repo';

const service = [UsersService, BcryptService, AuthService];
const commandHandler = [
  LoginUserCommandHandler,
  CreateUserCommandHandler,
  UpdateRefreshTokenHandler,
  DeleteDevicesCommandHandler,
  DeleteDeviceByIdCommandHandler,
  LogoutCommandHandler,
  DeleteCommandHandler,
];
const queryHandler = [GetDevicesQueryHandler];
const repository = [
  UsersRepository,
  UsersExternalQueryRepository,
  AuthQwRepository,
  SessionsRepository,
  SessionsQwRepository,
  UsersSqlQueryRepository,
  UsersSqlRepository,
  SessionsSqlRepository,
  SessionsQwSqlRepository,
];
@Module({
  imports: [
    JwtModule,
    PassportModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Session.name, schema: SessionSchema },
    ]),
    NotificationsModule,
  ],
  controllers: [UsersController, AuthController, SecurityDevicesController],
  providers: [
    {
      provide: ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (config: UserAccountsConfig): JwtService => {
        return new JwtService({
          secret: config.accessTokenSecret,
          signOptions: {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            expiresIn: config.accessTokenExpireIn as any,
          },
        });
      },
      inject: [UserAccountsConfig],
    },
    {
      provide: REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (config: UserAccountsConfig): JwtService => {
        return new JwtService({
          secret: config.refreshTokenSecret,
          signOptions: {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            expiresIn: config.refreshTokenExpireIn as any,
          },
        });
      },
      inject: [UserAccountsConfig],
    },
    ...service,
    ...commandHandler,
    ...queryHandler,
    ...repository,
    BasicAuthGuard,
    JwtAccessAuthGuard,
    JwtRefreshAuthGuard,
    JwtRefreshStrategy,
    JwtAccessStrategy,
    LocalAuthGuard,
    LocalStrategy,
    UserAccountsConfig,
  ],
  exports: [UsersExternalQueryRepository, JwtModule, UserAccountsConfig],
})
export class UserAccountsModule {}
