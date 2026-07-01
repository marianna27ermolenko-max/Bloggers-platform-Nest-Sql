import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtRefreshAuthGuard } from '../../guard/bearer/jwt.refresh-auth.guard';
import type { Request } from 'express';
import { ExtractRefreshPayload } from '../../guard/decorators/param/extract-refresh-payload-from-request';
import { JwtRefreshPayload } from '../../guard/bearer/type/refreshToken.payload';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetDevicesQuery } from '../application/query/get-devices-query';
import { DeleteDeviceByIdCommand } from '../application/usecases/delete-device-byId';
import { DeleteDevicesCommand } from '../application/usecases/delete-devices-usecases';
import { SessionViewSqlModel } from '../application/query/type/viewModelSql.devices';

@Controller('security/devices')
export class SecurityDevicesController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Get()
  @UseGuards(JwtRefreshAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getDevices(
    @ExtractRefreshPayload() payload: JwtRefreshPayload,
  ): Promise<SessionViewSqlModel[]> {
    return this.queryBus.execute(new GetDevicesQuery(payload.id));
  }

  @Delete()
  @UseGuards(JwtRefreshAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDevices(
    @ExtractRefreshPayload() payload: JwtRefreshPayload,
  ): Promise<void> {
    return this.commandBus.execute(
      new DeleteDevicesCommand(payload.id, payload.deviceId),
    );
  }

  @Delete(':deviceId')
  @UseGuards(JwtRefreshAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDeviceById(
    @Param('deviceId') devicedId: string,
    @ExtractRefreshPayload() payload: JwtRefreshPayload,
  ): Promise<void> {
    return this.commandBus.execute(
      new DeleteDeviceByIdCommand(devicedId, payload.id),
    );
  }
}
