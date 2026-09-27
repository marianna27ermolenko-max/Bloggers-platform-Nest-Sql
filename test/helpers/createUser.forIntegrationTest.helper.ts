import { CommandBus } from '@nestjs/cqrs';
import { CreateUserCommand } from 'src/modules/user-accounts/user/application/usecases/create-user.usecase';

export async function createTestUser(
  commandBus: CommandBus,
  login: string,
  email: string,
  password: string,
): Promise<string> {
  const userId = await commandBus.execute(
    new CreateUserCommand(login, email, password),
  );

  return userId;
}
