import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SessionViewSqlModel } from '../application/query/type/viewModelSql.devices';

@Injectable()
export class SessionsQwSqlRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getDevices(userId: number): Promise<SessionViewSqlModel[]> {
    const devices: SessionViewSqlModel[] = await this.dataSource.query(
      ` SELECT title, ip, device_id AS "deviceId", last_active_date AS "lastActiveDate"
        FROM sessions
        WHERE user_id = $1`,
      [userId],
    );

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
