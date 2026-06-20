import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Session,
  SessionDocument,
  type SessionModelType,
} from '../domain/session.entity';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';

@Injectable()
export class SessionsRepository {
  constructor(
    @InjectModel(Session.name) private SessionModel: SessionModelType,
  ) {}

  async save(session: SessionDocument): Promise<void> {
    await session.save();
  }

  async findSessionOrNotFoundFail(deviceId: string): Promise<SessionDocument> {
    const session = await this.SessionModel.findOne({ deviceId });
    if (!session) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Session not found',
      });
    }

    return session;
  }

  async findSession(deviceId: string): Promise<SessionDocument | null> {
    const session = await this.SessionModel.findOne({ deviceId });
    if (!session) {
      return null;
    }

    return session;
  }

  async deleteDevices(userId: string, deviceId: string): Promise<void> {
    await this.SessionModel.deleteMany({
      userId: userId,
      deviceId: { $ne: deviceId },
    });
  }

  async deleteDeviceByDeviceId(
    userId: string,
    deviceId: string,
  ): Promise<void> {
    const result = await this.SessionModel.deleteOne({ userId, deviceId });
    if (result.deletedCount !== 1) {
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: 'Session not delete',
      });
    }
  }
}
