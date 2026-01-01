import { LoginAttemptRepository } from '../domain/repositories/LoginAttemptRepository';
import { UserRepository } from '../domain/repositories/UserRepository';
import { SessionRepository } from '../domain/repositories/SessionRepository';
import { TokenGenerator } from './ports/TokenGenerator';
import { RefreshTokenGenerator } from './ports/RefreshTokenGenerator';
import { Email } from '../domain/value-objects/Email';
import { OTPCode } from '../domain/value-objects/OTPCode';
import { Session } from '../domain/entities/Session';
import { DomainError } from '@app/common/src/domain/DomainError';

interface VerifyOTPResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export class VerifyOTPUseCase {
  constructor(
    private loginAttemptRepository: LoginAttemptRepository,
    private userRepository: UserRepository,
    private sessionRepository: SessionRepository,
    private tokenGenerator: TokenGenerator,
    private refreshTokenGenerator: RefreshTokenGenerator
  ) {}

  async execute(email: string, code: string): Promise<VerifyOTPResult> {
    const emailVO = Email.create(email);
    const codeVO = OTPCode.create(code);
    const attempt = await this.loginAttemptRepository.findByEmail(emailVO);
    if (attempt.isNone()) {
      throw DomainError.createNotFound('No login attempt found');
    }
    const loginAttempt = attempt.getOrThrow();
    if (loginAttempt.isBlocked()) {
      throw DomainError.createValidation('Too many failed attempts. Try again in 30 minutes.');
    }
    if (!loginAttempt.verifyCode(codeVO)) {
      loginAttempt.registerFailedAttempt();
      await this.loginAttemptRepository.save(loginAttempt);
      throw DomainError.createValidation('Invalid or expired OTP code');
    }
    await this.loginAttemptRepository.deleteByEmail(emailVO);
    const user = await this.userRepository.findByEmail(emailVO);
    if (user.isNone()) {
      throw DomainError.createNotFound('User not found');
    }
    const userEntity = user.getOrThrow();
    await this.sessionRepository.deleteByUserId(userEntity.id);
    const refreshToken = this.refreshTokenGenerator.generate();
    const session = Session.create(userEntity.id, refreshToken);
    await this.sessionRepository.save(session);
    const accessToken = this.tokenGenerator.generate(emailVO);
    return {
      accessToken: accessToken.value,
      refreshToken: refreshToken.value,
      user: {
        id: userEntity.id.value,
        email: userEntity.email.value,
        name: userEntity.getName(),
      },
    };
  }
}
