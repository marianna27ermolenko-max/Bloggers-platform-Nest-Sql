import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionsRepository } from '../../infrastructure/session-devices.repo';

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
  constructor(private readonly sessionsRepository: SessionsRepository) {}

  async execute({ userId, deviceId }: DeleteDevicesCommand): Promise<void> {
    await this.sessionsRepository.findSessionOrNotFoundFail(deviceId);
    await this.sessionsRepository.deleteDevices(userId, deviceId);
  }
}
