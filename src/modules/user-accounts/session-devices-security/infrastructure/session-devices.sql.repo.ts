import { Injectable } from '@nestjs/common';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Not, Repository } from 'typeorm';
import { Session } from '../domain/session.entity';

@Injectable()
export class SessionsRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Session) private sessionRepository: Repository<Session>,
  ) {}

  //   async createSession(dto: CreateSessionModel): Promise<number> {
  //     const session: SessionViewModelSql[] = await this.dataSource.query(
  //       ` INSERT INTO sessions (
  //   user_id,
  //   device_id,
  //   title,
  //   ip,
  //   last_active_date,
  //   expiration_date
  // )
  //   VALUES ($1, $2, $3, $4, $5, $6)
  //   RETURNING
  //     id,
  //     user_id AS "userId",
  //     device_id AS "deviceId",
  //     title,
  //     ip,
  //     last_active_date AS "lastActiveDate",
  //     expiration_date AS "expirationDate";`,
  //       [
  //         dto.userId,
  //         dto.deviceId,
  //         dto.userAgent,
  //         dto.ip,
  //         dto.lastActiveDate,
  //         dto.expirationDate,
  //       ],
  //     );

  //     const sessionId = session[0].id;

  //     return sessionId;
  //   }

  async save(session: Session): Promise<void> {
    await this.sessionRepository.save(session);
  }

  async findSessionOrNotFoundFail(
    deviceId: string,
    userId: string,
  ): Promise<Session> {
    const session = await this.sessionRepository.findOne({
      where: { deviceId, userId },
    });

    if (!session) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Session not found',
      });
    }

    return session;
  }

  async findSession(deviceId: string): Promise<Session | null> {
    const session = await this.sessionRepository.findOne({
      where: { deviceId },
    });
    // if (!session) {
    //   return null;
    // }

    return session;
  }

  async deleteDevices(userId: string, deviceId: string): Promise<void> {
    await this.sessionRepository.delete({
      userId,
      deviceId: Not(deviceId),
    });
  }

  async deleteDeviceByDeviceId(
    userId: string,
    deviceId: string,
  ): Promise<void> {
    const result = await this.sessionRepository.delete({
      userId,
      deviceId,
    });

    if (result.affected === 0) {
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
