import { Injectable } from '@nestjs/common';
import { MeViewDto } from '../api/view-dto/auth.user.view-dto';
import { UsersSqlRepository } from '../../user/infrastructure/users.sql.repository';

@Injectable()
export class AuthQwRepository {
  constructor(private usersSqlRepository: UsersSqlRepository) {}

  async me(userId: number): Promise<MeViewDto> {
    const user = await this.usersSqlRepository.findOrNotFoundFail(userId);
    return MeViewDto.mapToView(user);
  }
}
