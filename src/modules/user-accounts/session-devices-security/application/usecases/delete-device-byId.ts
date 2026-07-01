import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { SessionsSqlRepository } from '../../infrastructure/session-devices.sql.repo';

export class DeleteDeviceByIdCommand extends Command<void> {
  constructor(
    public deviceId: string,
    public userId: number,
  ) {
    super();
  }
}

@CommandHandler(DeleteDeviceByIdCommand)
export class DeleteDeviceByIdCommandHandler implements ICommandHandler<
  DeleteDeviceByIdCommand,
  void
> {
  constructor(private readonly sessionsSqlRepository: SessionsSqlRepository) {}

  async execute({ deviceId, userId }: DeleteDeviceByIdCommand): Promise<void> {
    console.log(deviceId);

    const session =
      await this.sessionsSqlRepository.findSessionOrNotFoundFail(deviceId);

    console.log(session);

    if (!session) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Session not found',
      });
    }

    if (userId !== session.userId) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'Device belongs to another user',
      });
    }

    await this.sessionsSqlRepository.deleteDeviceByDeviceId(userId, deviceId);
  }
}
