import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionsRepository } from '../../infrastructure/session-devices.repo';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';

export class DeleteDeviceByIdCommand extends Command<void> {
  constructor(
    public deviceId: string,
    public userId: string,
  ) {
    super();
  }
}

@CommandHandler(DeleteDeviceByIdCommand)
export class DeleteDeviceByIdCommandHandler implements ICommandHandler<
  DeleteDeviceByIdCommand,
  void
> {
  constructor(private readonly sessionsRepository: SessionsRepository) {}

  async execute({ deviceId, userId }: DeleteDeviceByIdCommand): Promise<void> {
    const session =
      await this.sessionsRepository.findSessionOrNotFoundFail(deviceId);

    if (userId !== session.userId) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'Device belongs to another user',
      });
    }

    await this.sessionsRepository.deleteDeviceByDeviceId(userId, deviceId);
  }
}
