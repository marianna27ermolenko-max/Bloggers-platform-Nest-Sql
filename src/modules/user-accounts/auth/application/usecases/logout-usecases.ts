import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionsRepository } from 'src/modules/user-accounts/session-devices-security/infrastructure/session-devices.sql.repo';

export class LogoutCommand extends Command<void> {
  constructor(
    public userId: string,
    public deviceId: string,
  ) {
    super();
  }
}

@CommandHandler(LogoutCommand)
export class LogoutCommandHandler implements ICommandHandler<
  LogoutCommand,
  void
> {
  constructor(private sessionsSqlRepository: SessionsRepository) {}

  async execute({ userId, deviceId }: LogoutCommand): Promise<void> {
    await this.sessionsSqlRepository.findSessionOrNotFoundFail(
      deviceId,
      userId,
    );
    await this.sessionsSqlRepository.deleteDeviceByDeviceId(userId, deviceId);
  }
}
