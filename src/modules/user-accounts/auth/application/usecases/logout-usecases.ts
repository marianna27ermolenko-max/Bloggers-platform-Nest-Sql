import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionsSqlRepository } from 'src/modules/user-accounts/session-devices-security/infrastructure/session-devices.sql.repo';

export class LogoutCommand extends Command<void> {
  constructor(
    public userId: /* string */ number,
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
  constructor(private sessionsSqlRepository: SessionsSqlRepository) {}

  async execute({ userId, deviceId }: LogoutCommand): Promise<void> {
    return this.sessionsSqlRepository.deleteDeviceByDeviceId(userId, deviceId);
  }
}
