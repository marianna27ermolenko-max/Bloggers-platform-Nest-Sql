import { Injectable } from '@nestjs/common';
import { UserViewDtoAdmin } from '../../api/view-dto/users.view-dto';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../domain/user.entity';

@Injectable()
export class UsersExternalQueryRepository {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async getByIdOrNotFoundFail(id: string): Promise<UserViewDtoAdmin> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'user not found',
      });
    }
    return UserViewDtoAdmin.mapToView(user);
  }
}
