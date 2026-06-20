import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Session, type SessionModelType } from '../domain/session.entity';
import { SessionViewModel } from '../application/query/type/viewModel.devices';

@Injectable()
export class SessionsQwRepository {
  constructor(
    @InjectModel(Session.name) private SessionModel: SessionModelType,
  ) {}

  async getDevices(userId: string): Promise<SessionViewModel[]> {
    const devices = await this.SessionModel.find({ userId }).lean();

    return devices.map((device) =>
      SessionViewModel.mapToView({
        ip: device.ip,
        title: device.title,
        lastActiveDate: device.lastActiveDate,
        deviceId: device.deviceId,
      }),
    );
  }
}
