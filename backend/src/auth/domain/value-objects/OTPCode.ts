import { DomainError } from '@app/common/src/domain/DomainError';

export class OTPCode {
  private static readonly expirationMinutes = 5;

  private constructor(
    readonly value: string,
    readonly createdAt: Date
  ) {}

  static generate(): OTPCode {
    const minSixDigitNumber = 100000;
    const rangeSixDigitNumbers = 900000;
    const code = Math.floor(minSixDigitNumber + Math.random() * rangeSixDigitNumbers).toString();
    return new OTPCode(code, new Date());
  }

  static create(value: string, createdAt: Date = new Date()): OTPCode {
    const otpRegex = /^\d{6}$/;
    if (!otpRegex.test(value)) {
      throw DomainError.createValidation('Invalid OTP code format');
    }
    return new OTPCode(value, createdAt);
  }

  isExpired(): boolean {
    const now = new Date();
    const millisecondsElapsed = now.getTime() - this.createdAt.getTime();
    const millisecondsPerMinute = 60 * 1000;
    const minutesElapsed = millisecondsElapsed / millisecondsPerMinute;
    return minutesElapsed > OTPCode.expirationMinutes;
  }

  equals(other: OTPCode): boolean {
    return this.value === other.value;
  }
}
