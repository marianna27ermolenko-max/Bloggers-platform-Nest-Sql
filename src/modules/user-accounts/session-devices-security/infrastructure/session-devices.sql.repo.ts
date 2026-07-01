/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SessionViewModelSql } from '../application/query/type/viewModelSql.devices';
import { CreateSessionModel } from '../../auth/application/usecases/dto/create.session.dto';

@Injectable()
export class SessionsSqlRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createSession(dto: CreateSessionModel): Promise<number> {
    const session: SessionViewModelSql[] = await this.dataSource.query(
      ` INSERT INTO sessions (
  user_id,
  device_id,
  title,
  ip,
  last_active_date,
  expiration_date
)
  VALUES ($1, $2, $3, $4, $5, $6)
  RETURNING
    id,
    user_id AS "userId",
    device_id AS "deviceId",
    title,
    ip,
    last_active_date AS "lastActiveDate",
    expiration_date AS "expirationDate";`,
      [
        dto.userId,
        dto.deviceId,
        dto.userAgent,
        dto.ip,
        dto.lastActiveDate,
        dto.expirationDate,
      ],
    );

    const sessionId = session[0].id;

    return sessionId;
  }

  async findSessionOrNotFoundFail(
    deviceId: string,
  ): Promise<SessionViewModelSql> {
    const sessions: SessionViewModelSql[] = await this.dataSource.query(
      `SELECT   id,
      user_id AS "userId",
      ip,
      title,
      device_id AS "deviceId",
      last_active_date AS "lastActiveDate",
      expiration_date AS "expirationDate"
        FROM sessions
        WHERE device_id = $1
        `,
      [deviceId],
    );

    const session = sessions[0];
    if (!session) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Session not found',
      });
    }

    return session;
  }

  async findSession(deviceId: string): Promise<SessionViewModelSql | null> {
    const sessions: SessionViewModelSql[] = await this.dataSource.query(
      `SELECT  id,
       user_id AS "userId",
       device_id AS "deviceId",
       last_active_date AS "lastActiveDate",
       expiration_date AS "expirationDate",
       title,
        ip
        FROM sessions
        WHERE device_id = $1
        `,
      [deviceId],
    );

    const session = sessions[0];
    if (!session) {
      return null;
    }

    return session;
  }

  async deleteDevices(userId: number, deviceId: string): Promise<void> {
    await this.dataSource.query(
      ` DELETE FROM sessions 
        WHERE user_id = $1 AND device_id <> $2`,
      [userId, deviceId],
    );
  }

  async deleteDeviceByDeviceId(
    userId: number,
    deviceId: string,
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result: { id: number } | undefined = (
      await this.dataSource.query(
        ` DELETE FROM sessions 
        WHERE user_id = $1 AND device_id = $2`,
        [userId, deviceId],
      )
    )[0];

    if (!result) {
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: 'Session not delete',
      });
    }
  }

  async sessionUpdateActivity(
    deviceId: string,
    lastActiveDate: string,
    expirationDate: string,
  ): Promise<void> {
    await this.dataSource.query(
      `
      UPDATE sessions
      SET last_active_date = $1, expiration_date = $2
      wHERE device_id = $3`,
      [lastActiveDate, expirationDate, deviceId],
    );
  }
}
