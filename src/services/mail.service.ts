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
  service: 'gmail',
  auth: {
    user: this.config.get('MAIL_USER'),
    pass: this.config.get('MAIL_PASS'),
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
  console.log('📤 Preparing to send email...');
  console.log('📨 To:', to);
  console.log('📧 MAIL_USER:', this.config.get('MAIL_USER'));
  console.log('🔐 MAIL_PASS:', this.config.get('MAIL_PASS'));

  try {
    const result = await this.transporter.sendMail({
      from: `"Ton App" <${this.config.get('MAIL_USER')}>`,
      to,
      subject,
      text,
    });

    console.log('✅ Email sent successfully:', result);
  } catch (error) {
    console.error('❌ Email send failed:', error);
    throw new Error('Erreur lors de l’envoi de l’email: ' + error.message);
  }
}

  
}
