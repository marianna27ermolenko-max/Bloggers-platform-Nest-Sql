import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionsRepository } from '../../infrastructure/session-devices.sql.repo';

export class DeleteDevicesCommand extends Command<void> {
  constructor(
    public userId: string,
    public deviceId: string,
  ) {
    super();
  }
}

@CommandHandler(DeleteDevicesCommand)
export class DeleteDevicesCommandHandler implements ICommandHandler<
  DeleteDevicesCommand,
  void
> {
  constructor(private readonly sessionsSqlRepository: SessionsRepository) {}

  async execute({ userId, deviceId }: DeleteDevicesCommand): Promise<void> {
    await this.sessionsSqlRepository.findSessionOrNotFoundFail(
      deviceId,
      userId,
    );
    await this.sessionsSqlRepository.deleteDevices(userId, deviceId);
  }
}
