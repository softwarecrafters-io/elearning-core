import { EmailSender } from '../../application/ports/EmailSender';
import { Email } from '../../domain/value-objects/Email';
import { OTPCode } from '../../domain/value-objects/OTPCode';

export class ConsoleEmailSender implements EmailSender {
  async sendOTP(email: Email, otp: OTPCode): Promise<void> {
    console.log('');
    console.log('========================================');
    console.log(`  📧 OTP para ${email.value}: ${otp.value}`);
    console.log('========================================');
    console.log('');
  }
}
