import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from './email.service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        service: 'Mail.ru',

        auth: {
          user: process.env.EMAIL || 'maryincubator@mail.ru',
          pass: process.env.EMAIL_PASS || 'gGCS95DU0aIx5GeckgPo', //код обязательно вынести в env
        },
      },

      defaults: {
        from: `"Marianna" <${process.env.EMAIL || 'maryincubator@mail.ru'}>`,
      },
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class NotificationsModule {}
