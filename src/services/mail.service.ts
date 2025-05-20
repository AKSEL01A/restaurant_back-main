import * as nodemailer from 'nodemailer';
const sgTransport = require('nodemailer-sendgrid-transport');
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private transporter;

  constructor(private config: ConfigService) {
    const options = {
      auth: {
        api_key: this.config.get('SENDGRID_API_KEY'),
      },
    };

    this.transporter = nodemailer.createTransport(sgTransport(options)); // ✅ Utilisation correcte
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
