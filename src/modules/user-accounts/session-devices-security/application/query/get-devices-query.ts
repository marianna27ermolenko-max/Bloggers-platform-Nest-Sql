import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { SessionViewSqlModel } from './type/viewModelSql.devices';
import { SessionsQwRepository } from '../../infrastructure/session-devices.qw.sql.repo';

export class GetDevicesQuery extends Query<SessionViewSqlModel[]> {
  constructor(public userId: string) {
    super();
  }
}

@QueryHandler(GetDevicesQuery)
export class GetDevicesQueryHandler implements IQueryHandler<
  GetDevicesQuery,
  SessionViewSqlModel[]
> {
  constructor(private readonly sessionsQwSqlRepository: SessionsQwRepository) {}

  async execute(query: GetDevicesQuery): Promise<SessionViewSqlModel[]> {
    return this.sessionsQwSqlRepository.getDevices(query.userId);
  }
}
