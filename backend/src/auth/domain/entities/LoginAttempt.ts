import { Id } from '../../../shared/domain/value-objects/Id';
import { Email } from '../value-objects/Email';
import { OTPCode } from '../value-objects/OTPCode';
import { Maybe } from '@app/common/src/domain/Maybe';

export class LoginAttempt {
  private failedAttempts: number;
  private lastFailedAt: Maybe<Date>;

  private constructor(
    readonly id: Id,
    readonly email: Email,
    readonly otpCode: OTPCode,
    failedAttempts: number,
    lastFailedAt: Maybe<Date>
  ) {
    this.failedAttempts = failedAttempts;
    this.lastFailedAt = lastFailedAt;
  }

  static create(email: Email, otpCode: OTPCode): LoginAttempt {
    return new LoginAttempt(Id.generate(), email, otpCode, 0, Maybe.none());
  }

  static reconstitute(
    email: Email,
    otpCode: OTPCode,
    failedAttempts: number = 0,
    lastFailedAt: Maybe<Date> = Maybe.none()
  ): LoginAttempt {
    return new LoginAttempt(Id.generate(), email, otpCode, failedAttempts, lastFailedAt);
  }

  isExpired(): boolean {
    return this.otpCode.isExpired();
  }

  verifyCode(code: OTPCode): boolean {
    return this.otpCode.equals(code) && !this.isExpired();
  }

  getFailedAttempts(): number {
    return this.failedAttempts;
  }

  registerFailedAttempt(): void {
    if (this.hasBlockExpired()) {
      this.failedAttempts = 0;
    }
    this.failedAttempts++;
    this.lastFailedAt = Maybe.some(new Date());
  }

  isBlocked(): boolean {
    const maxAttempts = 5;
    if (this.failedAttempts < maxAttempts) {
      return false;
    }
    return !this.hasBlockExpired();
  }

  private hasBlockExpired(): boolean {
    if (this.lastFailedAt.isNone()) {
      return false;
    }
    const blockDurationMinutes = 30;
    const minutesSinceLastFail = (Date.now() - this.lastFailedAt.getOrThrow().getTime()) / (1000 * 60);
    return minutesSinceLastFail >= blockDurationMinutes;
  }

  getLastFailedAt(): Maybe<Date> {
    return this.lastFailedAt;
  }
}
