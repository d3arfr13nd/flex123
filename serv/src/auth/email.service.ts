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
      subject: 'Password Reset Request',
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
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hello ${userName},</p>
              <p>We received a request to reset your password. Click the button below to reset it:</p>
              <div style="text-align: center;">
                <a href="${resetLink}" class="button">Reset Password</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <div class="token-box">${resetLink}</div>
              <p>If you prefer, you can also use this reset token directly:</p>
              <div class="token-box">${resetToken}</div>
              <div class="warning">
                <strong>⚠️ Important:</strong> This link will expire in 1 hour. If you didn't request this password reset, please ignore this email or contact our support team.
              </div>
              <p>Best regards,<br>The ${appName} Team</p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Hello ${userName},
        
        We received a request to reset your password. Use the following link to reset it:
        
        ${resetLink}
        
        Or use this reset token directly:
        ${resetToken}
        
        ⚠️ Important: This link will expire in 1 hour. If you didn't request this password reset, please ignore this email or contact our support team.
        
        Best regards,
        The ${appName} Team
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
              <h1>Password Reset Successful</h1>
            </div>
            <div class="content">
              <p>Hello ${userName},</p>
              <p>This is to confirm that your password has been successfully reset.</p>
              <p>If you did not make this change, please contact our support team immediately.</p>
              <p>For security reasons, we recommend that you:</p>
              <ul>
                <li>Use a strong, unique password</li>
                <li>Never share your password with anyone</li>
                <li>Enable two-factor authentication if available</li>
              </ul>
              <p>Best regards,<br>The ${appName} Team</p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Hello ${userName},
        
        This is to confirm that your password has been successfully reset.
        
        If you did not make this change, please contact our support team immediately.
        
        For security reasons, we recommend that you:
        - Use a strong, unique password
        - Never share your password with anyone
        - Enable two-factor authentication if available
        
        Best regards,
        The ${appName} Team
      `,
    };

    console.log(1);
    try {
      await this.transporter.sendMail({
        from: `"${appName}" <${fromEmail}>`,
        to: email,
        subject: 'Password Reset Successful',
        html: "test1",
        text: "test2",
      });
    } catch (error) {
      console.error('Error sending password reset confirmation email:', error);
      // Don't throw error - email failure shouldn't break password reset
    }
  }
}

