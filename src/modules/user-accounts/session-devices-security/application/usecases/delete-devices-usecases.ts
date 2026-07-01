import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionsSqlRepository } from '../../infrastructure/session-devices.sql.repo';

export class DeleteDevicesCommand extends Command<void> {
  constructor(
    public userId: number,
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
  constructor(private readonly sessionsSqlRepository: SessionsSqlRepository) {}

  async execute({ userId, deviceId }: DeleteDevicesCommand): Promise<void> {
    await this.sessionsSqlRepository.findSessionOrNotFoundFail(deviceId);
    await this.sessionsSqlRepository.deleteDevices(userId, deviceId);
  }
}
