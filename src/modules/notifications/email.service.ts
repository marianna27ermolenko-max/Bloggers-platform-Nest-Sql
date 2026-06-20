import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendConfirmationEmail(email: string, code: string): Promise<boolean> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Email confirmation',
        from: `"Marianna" <maryincubator@mail.ru>`, // from: `"Marianna" <${process.env.EMAIL}>`,
        html: this.getConfirmationTemplate(code),
      });

      return true;
    } catch (e) {
      console.log('Email send error:', e);
      return false;
    }
  }

  private getConfirmationTemplate(code: string): string {
    return ` <h1>Thank for your registration</h1>
               <p>To finish registration please follow the link below:
                  <a href='https://somesite.com/confirm-email?code=${code}'>complete registration</a>
              </p>`;
  }
}
