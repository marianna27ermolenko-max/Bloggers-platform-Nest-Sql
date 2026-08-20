import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from '../../user/dto/create-user.dto';
import { ConfirmationDto } from './input-dto/confirmation.dto';
import { EmailResendingInputDto } from './input-dto/auth.email.resending.input.dto';
import { PasswordRecoveryDto } from './input-dto/зassword.recovery.input.dto';
import { NewPasswordInputDto } from './input-dto/new.passwort.input.dto';
import { AuthQwRepository } from '../infrastructure/auth.query-repository';
import { MeViewDto } from './view-dto/auth.user.view-dto';
import { LocalAuthGuard } from '../../guard/local/local-auth.guard';
import { ApiBody } from '@nestjs/swagger';
import { ExtractUserFromRequest } from '../../guard/decorators/param/extract-user-from-request.decorator';
import { UserContextDto } from '../../guard/dto/user-context.dto';
import { ThrottlerGuard } from '@nestjs/throttler';
import { LoginInputDto } from './input-dto/auth.input-dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { LoginUserCommand } from '../application/usecases/login-user.usecase';
import type { Response, Request } from 'express';
import { AuthService } from '../application/auth.service';
import { JwtRefreshAuthGuard } from '../../guard/bearer/jwt.refresh-auth.guard';
import { UpdateRefreshToken } from '../application/usecases/refresh-token.usecases';
import { JwtRefreshPayload } from '../../guard/bearer/type/refreshToken.payload';
import { ExtractRefreshPayload } from '../../guard/decorators/param/extract-refresh-payload-from-request';
import { LogoutCommand } from '../application/usecases/logout-usecases';
import { JwtAccessAuthGuard } from '../../guard/bearer/jwt.access-auth.guard';
import { RegistrationUserCommand } from '../application/usecases/register-user.usecase';
import { RegistrationConfirmationCommand } from '../application/usecases/registration-confirmation.usecase';
import { RegistrationEmailResendingCommand } from '../application/usecases/registration-email-resending.usecase';
import { PasswordRecoveryCommand } from '../application/usecases/password-recovery.usecase';
import { NewPasswordCommand } from '../application/usecases/new-password.usecase';
import { MeQuery } from '../application/query/me.query';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private authQwRepository: AuthQwRepository,
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @UseGuards(ThrottlerGuard)
  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() body: CreateUserDto): Promise<void> {
    await this.commandBus.execute(
      new RegistrationUserCommand(body.login, body.email, body.password),
    );
  }

  @Post('registration-confirmation')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationConfirmation(@Body() body: ConfirmationDto): Promise<void> {
    await this.commandBus.execute(
      new RegistrationConfirmationCommand(body.code),
    );
  }

  @Post('registration-email-resending')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationEmailResending(@Body() body: EmailResendingInputDto) {
    await this.commandBus.execute(
      new RegistrationEmailResendingCommand(body.email),
    );
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @UseGuards(ThrottlerGuard)
  @ApiBody({ type: LoginInputDto })
  async login(
    @ExtractUserFromRequest() user: UserContextDto,
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ accessToken: string }> {
    const userAgent = req.headers['user-agent'] ?? 'unknown';
    const ip = req.ip ?? 'unknown';

    const tokens = await this.commandBus.execute(
      new LoginUserCommand(user.id, userAgent, ip),
    );

    response.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    return { accessToken: tokens.accessToken };
  }

  @Post('refresh-token')
  @UseGuards(JwtRefreshAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateRefreshToken(
    @ExtractUserFromRequest() user: UserContextDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const refreshToken = req.cookies.refreshToken as string;

    const tokens = await this.commandBus.execute(
      new UpdateRefreshToken({ id: user.id }, refreshToken),
    );

    res.cookie('refreshToken', tokens.newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    return { accessToken: tokens.newAccessToken };
  }

  @Post('password-recovery')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(@Body() body: PasswordRecoveryDto): Promise<void> {
    await this.commandBus.execute(new PasswordRecoveryCommand(body.email));
  }

  @Post('new-password')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async newPassword(@Body() body: NewPasswordInputDto): Promise<void> {
    await this.commandBus.execute(
      new NewPasswordCommand(body.newPassword, body.recoveryCode),
    );
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtRefreshAuthGuard)
  async logout(
    @ExtractRefreshPayload() payload: JwtRefreshPayload,
  ): Promise<void> {
    await this.commandBus.execute(
      new LogoutCommand(payload.id, payload.deviceId),
    );
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAccessAuthGuard)
  async getMeInfo(
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<MeViewDto> {
    return this.queryBus.execute(new MeQuery(user.id));
  }
}
