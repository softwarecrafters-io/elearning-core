import { Email } from '../../domain/value-objects/Email';
import { OTPCode } from '../../domain/value-objects/OTPCode';

export interface EmailSender {
  sendOTP(email: Email, otp: OTPCode): Promise<void>;
}
