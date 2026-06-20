import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';

export class UpdateUserCommand extends Command<void> {
  constructor(
    public id: string,
    public email: string,
  ) {
    super();
  }
}

@CommandHandler(UpdateUserCommand) //пока нигде не используем
export class UpdateUserUseCase implements ICommandHandler<
  UpdateUserCommand,
  void
> {
  constructor(private usersRepository: UsersRepository) {}

  async execute({ id, email }: UpdateUserCommand): Promise<void> {
    const user = await this.usersRepository.findOrNotFoundFail(id);
    user.update({ email });
    await this.usersRepository.save(user);
  }
}
