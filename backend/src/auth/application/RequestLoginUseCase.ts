import { UserRepository } from '../domain/repositories/UserRepository';
import { LoginAttemptRepository } from '../domain/repositories/LoginAttemptRepository';
import { EmailSender } from './ports/EmailSender';
import { OTPGenerator } from './ports/OTPGenerator';
import { Email } from '../domain/value-objects/Email';
import { LoginAttempt } from '../domain/entities/LoginAttempt';
import { DomainError } from '@app/common/src/domain/DomainError';

export class RequestLoginUseCase {
  constructor(
    private userRepository: UserRepository,
    private loginAttemptRepository: LoginAttemptRepository,
    private emailSender: EmailSender,
    private otpGenerator: OTPGenerator
  ) {}

  async execute(email: string): Promise<void> {
    const emailVO = Email.create(email);
    const user = await this.userRepository.findByEmail(emailVO);
    if (user.isNone()) {
      throw DomainError.createNotFound('User not found');
    }
    const otpCode = this.otpGenerator.generate();
    const attempt = LoginAttempt.create(emailVO, otpCode);
    await this.loginAttemptRepository.save(attempt);
    await this.emailSender.sendOTP(emailVO, attempt.otpCode);
  }
}
