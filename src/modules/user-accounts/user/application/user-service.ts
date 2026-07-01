import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../domain/user.entity';
import type { UserModelType } from '../domain/user.entity';
import { UsersRepository } from '../infrastructure/users.repository';

import { BcryptService } from '../../auth/application/bcrypt.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
    private readonly usersRepository: UsersRepository,
    private bcryptService: BcryptService,
  ) {}

  //перенесли  в юз-кейс
  // async createUser(dto: CreateUserDto): Promise<string> {
  //   const passwordHash = await this.bcryptService.generationHash(dto.password);

  //   const user = this.UserModel.createInstanceAdmin({
  //     login: dto.login,
  //     email: dto.email,
  //     passwordHash,
  //   });

  //   await this.usersRepository.save(user);

  //   return user._id.toString();
  // }

  // async updateUser(id: string, dto: UpdateUserDto): Promise<string> {
  //   const user = await this.usersRepository.findOrNotFoundFail(id);

  //   user.update(dto);
  //   await this.usersRepository.save(user);

  //   return user._id.toString();
  // }

  //перенесли  в юз-кейс
  // async deleteUser(id: string): Promise<void> {
  //   const user = await this.usersRepository.findOrNotFoundFail(id);
  //   user.makeDeleted();
  //   await this.usersRepository.save(user);
  // }
}
