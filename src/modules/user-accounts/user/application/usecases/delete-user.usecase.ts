import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersSqlRepository } from '../../infrastructure/users.sql.repository';

export class DeleteCommand extends Command<void> {
  constructor(public id: number) {
    super();
  }
}

@CommandHandler(DeleteCommand)
export class DeleteCommandHandler implements ICommandHandler<
  DeleteCommand,
  void
> {
  constructor(private readonly usersSqlRepository: UsersSqlRepository) {}

  async execute({ id }: DeleteCommand): Promise<void> {
    await this.usersSqlRepository.findOrNotFoundFail(id);
    await this.usersSqlRepository.deleteUser(id);
  }
}
