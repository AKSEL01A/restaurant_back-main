import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class MailService {
//   private transporter = nodemailer.createTransport({
//     service: 'gmail',
//     // host: 'smtp.gmail.com',
//     //port: 587,
//     auth: {
//         user: this.config.get('MAIL_USER'),
//         pass: this.config.get('MAIL_PASS'),
      
//     },
//   });

private transporter;

constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "e0ef9982aa1083",
          pass: "fd046049c1e693"
        }
      });
  }

  async sendMail({
    to,
    subject,
    text,
  }: {
    to: string;
    subject: string;
    text: string;
  }) {
    await this.transporter.sendMail({
      from: `"Ton App" <${this.config.get('MAIL_USER')}>`,
      to,
      subject,
      text,
    });
  }
  
}
