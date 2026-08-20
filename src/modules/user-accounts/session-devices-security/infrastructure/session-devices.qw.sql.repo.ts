import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SessionViewSqlModel } from '../application/query/type/viewModelSql.devices';
import { Session } from '../domain/session.entity';

@Injectable()
export class SessionsQwRepository {
  constructor(
    @InjectRepository(Session) private repoSession: Repository<Session>,
  ) {}

  async getDevices(userId: string): Promise<SessionViewSqlModel[]> {
    const devices = await this.repoSession.find({
      where: { userId },
      select: {
        ip: true,
        title: true,
        lastActiveDate: true,
        deviceId: true,
      },
    });

    return devices.map((device) =>
      SessionViewSqlModel.mapToView({
        ip: device.ip,
        title: device.title,
        lastActiveDate: device.lastActiveDate,
        deviceId: device.deviceId,
      }),
    );
  }
}
