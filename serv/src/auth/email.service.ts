import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: true,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendPasswordResetLink(email: string, userName: string, resetToken: string): Promise<void> {
    const appName = this.configService.get<string>('APP_NAME', 'FlexSpace');
    const fromEmail = this.configService.get<string>('SMTP_FROM', 'support@flexspace.com');
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"${appName}" <${fromEmail}>`,
      to: email,
      subject: 'Запит на скидання пароля',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
            .button { display: inline-block; padding: 12px 30px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .token-box { background-color: #fff; border: 2px dashed #2196F3; padding: 15px; margin: 20px 0; text-align: center; font-family: monospace; word-break: break-all; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Запит на скидання пароля</h1>
            </div>
            <div class="content">
              <p>Вітаємо, ${userName},</p>
              <p>Ми отримали запит на скидання вашого пароля. Натисніть кнопку нижче, щоб скинути його:</p>
              <div style="text-align: center;">
                <a href="${resetLink}" class="button">Скинути пароль</a>
              </div>
              <p>Або скопіюйте та вставте це посилання у ваш браузер:</p>
              <div class="token-box">${resetLink}</div>
              <p>Якщо бажаєте, ви також можете використати цей токен скидання безпосередньо:</p>
              <div class="token-box">${resetToken}</div>
              <div class="warning">
                <strong>⚠️ Важливо:</strong> Це посилання дійсне протягом 1 години. Якщо ви не запитували скидання пароля, будь ласка, проігноруйте цей лист або зв'яжіться з нашою службою підтримки.
              </div>
              <p>З повагою,<br>Команда ${appName}</p>
            </div>
            <div class="footer">
              <p>Це автоматичне повідомлення. Будь ласка, не відповідайте на цей лист.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Вітаємо, ${userName},
        
        Ми отримали запит на скидання вашого пароля. Використайте наступне посилання для скидання:
        
        ${resetLink}
        
        Або використайте цей токен скидання безпосередньо:
        ${resetToken}
        
        ⚠️ Важливо: Це посилання дійсне протягом 1 години. Якщо ви не запитували скидання пароля, будь ласка, проігноруйте цей лист або зв'яжіться з нашою службою підтримки.
        
        З повагою,
        Команда ${appName}
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      // Don't throw error - email failure shouldn't break the flow
    }
  }

  async sendPasswordResetConfirmation(email: string, userName: string): Promise<void> {
    const appName = this.configService.get<string>('APP_NAME', 'FlexSpace');
    const fromEmail = "support@flexspace.com";
    console.log(2);
    const mailOptions = {
      from: `"${appName}" <${fromEmail}>`,
      to: email,
      subject: 'Password Reset Successful',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Пароль успішно скинуто</h1>
            </div>
            <div class="content">
              <p>Вітаємо, ${userName},</p>
              <p>Це підтвердження того, що ваш пароль було успішно скинуто.</p>
              <p>Якщо ви не робили цю зміну, будь ласка, негайно зв'яжіться з нашою службою підтримки.</p>
              <p>З міркувань безпеки ми рекомендуємо вам:</p>
              <ul>
                <li>Використовувати надійний, унікальний пароль</li>
                <li>Ніколи не ділитися своїм паролем з кимось</li>
                <li>Увімкнути двофакторну аутентифікацію, якщо вона доступна</li>
              </ul>
              <p>З повагою,<br>Команда ${appName}</p>
            </div>
            <div class="footer">
              <p>Це автоматичне повідомлення. Будь ласка, не відповідайте на цей лист.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Вітаємо, ${userName},
        
        Це підтвердження того, що ваш пароль було успішно скинуто.
        
        Якщо ви не робили цю зміну, будь ласка, негайно зв'яжіться з нашою службою підтримки.
        
        З міркувань безпеки ми рекомендуємо вам:
        - Використовувати надійний, унікальний пароль
        - Ніколи не ділитися своїм паролем з кимось
        - Увімкнути двофакторну аутентифікацію, якщо вона доступна
        
        З повагою,
        Команда ${appName}
      `,
    };

    try {
      await this.transporter.sendMail({
        from: `"${appName}" <${fromEmail}>`,
        to: email,
        subject: 'Пароль успішно скинуто',
        html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Пароль успішно скинуто</h1>
            </div>
            <div class="content">
              <p>Вітаємо, ${userName},</p>
              <p>Це підтвердження того, що ваш пароль було успішно скинуто.</p>
              <p>Якщо ви не робили цю зміну, будь ласка, негайно зв'яжіться з нашою службою підтримки.</p>
              <p>З міркувань безпеки ми рекомендуємо вам:</p>
              <ul>
                <li>Використовувати надійний, унікальний пароль</li>
                <li>Ніколи не ділитися своїм паролем з кимось</li>
                <li>Увімкнути двофакторну аутентифікацію, якщо вона доступна</li>
              </ul>
              <p>З повагою,<br>Команда ${appName}</p>
            </div>
            <div class="footer">
              <p>Це автоматичне повідомлення. Будь ласка, не відповідайте на цей лист.</p>
            </div>
          </div>
        </body>
        </html>
      `,
        text: `
        Вітаємо, ${userName},
        
        Це підтвердження того, що ваш пароль було успішно скинуто.
        
        Якщо ви не робили цю зміну, будь ласка, негайно зв'яжіться з нашою службою підтримки.
        
        З міркувань безпеки ми рекомендуємо вам:
        - Використовувати надійний, унікальний пароль
        - Ніколи не ділитися своїм паролем з кимось
        - Увімкнути двофакторну аутентифікацію, якщо вона доступна
        
        З повагою,
        Команда ${appName}
      `,
      });
    } catch (error) {
      console.error('Error sending password reset confirmation email:', error);
      // Don't throw error - email failure shouldn't break password reset
    }
  }
}

