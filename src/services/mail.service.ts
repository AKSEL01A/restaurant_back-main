import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: this.config.get('SENDGRID_API_KEY'),
      },
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
    try {
      const result = await this.transporter.sendMail({
        from: this.config.get('MAIL_USER'),
        to,
        subject,
        text,
      });

      console.log('✅ Email sent:', result);
    } catch (error) {
      console.error('❌ Email send failed:', error);
      throw new Error('Erreur lors de l’envoi de l’email: ' + error.message);
    }
  }
}
