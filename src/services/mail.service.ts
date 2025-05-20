import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as sgTransport from 'nodemailer-sendgrid-transport';

@Injectable()
export class MailService {
  private transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport(
      sgTransport({
        auth: {
          api_key: this.config.get<string>('SENDGRID_API_KEY'),
        },
      }),
    );
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
    console.log('📤 Envoi via SendGrid...');
    try {
      const result = await this.transporter.sendMail({
        from: 'reservinipfe@gmail.com', // 🟢 هذا الإيميل لازم يكون "Verified"
        to,
        subject,
        text,
      });

      console.log('✅ Email envoyé:', result);
    } catch (error) {
      console.error('❌ Erreur SendGrid:', error);
      throw new Error('Erreur lors de l’envoi de l’email: ' + error.message);
    }
  }
}
