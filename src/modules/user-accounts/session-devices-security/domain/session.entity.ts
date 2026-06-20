import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

@Schema({ timestamps: true })
export class Session {
  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true, unique: true })
  deviceId: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true, default: 'unknown' })
  ip: string;

  @Prop({ type: String, required: true })
  lastActiveDate: string;

  @Prop({ type: String, required: true })
  expirationDate: string;

  static createSession(
    userId: string,
    deviceId: string,
    title: string,
    ip: string,
    lastActiveDate: string,
    expirationDate: string,
  ) {
    const session = new this();
    session.userId = userId;
    session.deviceId = deviceId;
    session.title = title;
    session.ip = ip;
    session.lastActiveDate = lastActiveDate;
    session.expirationDate = expirationDate;

    return session as SessionDocument;
  }

  updateActivity(
    this: SessionDocument,
    lastActiveDate: string,
    expirationDate: string,
  ) {
    this.lastActiveDate = lastActiveDate;
    this.expirationDate = expirationDate;
  }
}

export const SessionSchema = SchemaFactory.createForClass(Session);

SessionSchema.loadClass(Session);

export type SessionDocument = HydratedDocument<Session>;
export type SessionModelType = Model<SessionDocument> & typeof Session;
