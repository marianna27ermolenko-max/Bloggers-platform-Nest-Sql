import { BaseDBEntity } from '../../../../core/BaseDBEntity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from '../../user/domain/user.entity';

@Entity()
export class Session extends BaseDBEntity {
  @Column({ type: 'varchar' })
  deviceId: string;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'varchar', length: 255, default: 'unknown' })
  ip: string;

  @Column({
    type: 'timestamptz',
    default: 'now()',
  })
  lastActiveDate: Date;

  @Column({
    type: 'timestamptz',
    default: 'now()',
  })
  expirationDate: Date;

  @Column({ type: 'varchar' })
  userId: string;

  @ManyToOne(() => User, (user) => user.sessions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  // user: User; //я могу использовать в коде только тогда когда подгружу relations в запросе
  @JoinColumn({ name: 'userId' })
  user: User;

  static createSession(
    deviceId: string,
    userId: string,
    userAgent: string,
    ip: string,
    lastActiveDate: Date,
    expirationDate: Date,
  ): Session {
    const session = new Session();
    session.userId = userId;
    session.deviceId = deviceId;
    session.title = userAgent;
    session.lastActiveDate = lastActiveDate;
    session.expirationDate = expirationDate;
    session.ip = ip;

    return session;
  }

  updateActivity(lastActiveDate: Date, expirationDate: Date) {
    this.lastActiveDate = lastActiveDate;
    this.expirationDate = expirationDate;
  }
}

// @Prop({ type: String, required: true })
// userId: string;

// @Prop({ type: String, required: true, unique: true })
// deviceId: string;

// @Prop({ type: String, required: true })
// title: string;

// @Prop({ type: String, required: true, default: 'unknown' })
// ip: string;

// @Prop({ type: String, required: true })
// lastActiveDate: string;

// @Prop({ type: String, required: true })
// expirationDate: string;

// static createSession(
//   userId: string,
//   deviceId: string,
//   title: string,
//   ip: string,
//   lastActiveDate: string,
//   expirationDate: string,
// ) {
//   const session = new this();
//   session.userId = userId;
//   session.deviceId = deviceId;
//   session.title = title;
//   session.ip = ip;
//   session.lastActiveDate = lastActiveDate;
//   session.expirationDate = expirationDate;

//   return session as SessionDocument;
// }

// updateActivity(
//   this: SessionDocument,
//   lastActiveDate: string,
//   expirationDate: string,
// ) {
//   this.lastActiveDate = lastActiveDate;
//   this.expirationDate = expirationDate;
// }
