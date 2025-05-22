import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.config.get('MAIL_USER'),
        pass: this.config.get('GMAIL_APP_PASSWORD'),
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

  async sendUserWelcomeEmail(email: string, payload: { name: string, password: string }) {
    const text = `
Bonjour ${payload.name},

Votre compte a été créé avec succès 🎉

Voici votre mot de passe temporaire : ${payload.password}

Veuillez vous connecter et le modifier dès que possible.

Cordialement,
L'équipe
`;

    await this.sendMail({
      to: email,
      subject: 'Bienvenue - Vos identifiants',
      text,
    });
  }

}
