import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.sql.repository';

export class DeleteCommand extends Command<void> {
  constructor(public id: string) {
    super();
  }
}

@CommandHandler(DeleteCommand)
export class DeleteCommandHandler implements ICommandHandler<
  DeleteCommand,
  void
> {
  constructor(private readonly usersSqlRepository: UsersRepository) {}

  async execute({ id }: DeleteCommand): Promise<void> {
    await this.usersSqlRepository.findOrNotFoundFail(id);
    await this.usersSqlRepository.softDeleteUser(id);
  }
}
