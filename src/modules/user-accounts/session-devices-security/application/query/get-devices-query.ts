import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { SessionViewModel } from './type/viewModel.devices';
import { SessionsQwRepository } from '../../infrastructure/session-devices.qw.repo';

export class GetDevicesQuery extends Query<SessionViewModel[]> {
  constructor(public userId: string) {
    super();
  }
}

@QueryHandler(GetDevicesQuery)
export class GetDevicesQueryHandler implements IQueryHandler<
  GetDevicesQuery,
  SessionViewModel[]
> {
  constructor(private readonly sessionsQwRepository: SessionsQwRepository) {}

  async execute(query: GetDevicesQuery): Promise<SessionViewModel[]> {
    return this.sessionsQwRepository.getDevices(query.userId);
  }
}
