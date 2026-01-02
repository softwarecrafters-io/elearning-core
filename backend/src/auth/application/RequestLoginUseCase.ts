import { UserRepository } from '../domain/repositories/UserRepository';
import { LoginAttemptRepository } from '../domain/repositories/LoginAttemptRepository';
import { EmailSender } from './ports/EmailSender';
import { OTPGenerator } from './ports/OTPGenerator';
import { Email } from '../domain/value-objects/Email';
import { LoginAttempt } from '../domain/entities/LoginAttempt';
import { User } from '../domain/entities/User';
import { DomainError } from '@app/common/src/domain/DomainError';

export class RequestLoginUseCase {
  constructor(
    private userRepository: UserRepository,
    private loginAttemptRepository: LoginAttemptRepository,
    private emailSender: EmailSender,
    private otpGenerator: OTPGenerator,
    private adminEmail?: string
  ) {}

  async execute(email: string): Promise<void> {
    const emailVO = Email.create(email);
    let user = await this.userRepository.findByEmail(emailVO);
    if (user.isNone()) {
      if (this.adminEmail && email === this.adminEmail) {
        const adminUser = User.createAdmin(emailVO, 'Admin');
        await this.userRepository.save(adminUser);
        user = await this.userRepository.findByEmail(emailVO);
      } else {
        throw DomainError.createNotFound('User not found');
      }
    }
    const otpCode = this.otpGenerator.generate();
    const attempt = LoginAttempt.create(emailVO, otpCode);
    await this.loginAttemptRepository.save(attempt);
    await this.emailSender.sendOTP(emailVO, attempt.otpCode);
  }
}
