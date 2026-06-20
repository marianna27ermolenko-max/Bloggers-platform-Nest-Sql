import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../../user/domain/user.entity';
import type { UserModelType } from '../../user/domain/user.entity';
import { UsersRepository } from '../infrastructure/users.repository';

import { BcryptService } from '../../auth/application/bcrypt.service';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
    private readonly usersRepository: UsersRepository,
    private bcryptService: BcryptService,
  ) {}

  async createUser(dto: CreateUserDto): Promise<string> {
    const passwordHash = await this.bcryptService.generationHash(dto.password);

    const user = this.UserModel.createInstanceAdmin({
      login: dto.login,
      email: dto.email,
      passwordHash,
    });

    await this.usersRepository.save(user);

    return user._id.toString();
  }

  // async updateUser(id: string, dto: UpdateUserDto): Promise<string> {
  //   const user = await this.usersRepository.findOrNotFoundFail(id);

  //   user.update(dto);
  //   await this.usersRepository.save(user);

  //   return user._id.toString();
  // }

  async deleteUser(id: string): Promise<void> {
    const user = await this.usersRepository.findOrNotFoundFail(id);
    user.makeDeleted();
    await this.usersRepository.save(user);
  }
}
