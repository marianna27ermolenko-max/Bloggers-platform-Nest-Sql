import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { MeViewDto } from '../../api/view-dto/auth.user.view-dto';
import { AuthQwRepository } from '../../infrastructure/auth.query-repository';

export class MeQuery extends Query<MeViewDto> {
  constructor(public userId: string) {
    super();
  }
}

@QueryHandler(MeQuery)
export class MeQueryHandler implements IQueryHandler<MeQuery, MeViewDto> {
  constructor(private readonly authQwRepository: AuthQwRepository) {}

  async execute({ userId }: MeQuery): Promise<MeViewDto> {
    return await this.authQwRepository.me(userId);
  }
}
