import { LoginAttempt } from '../../../../domain/entities/LoginAttempt';
import { Email } from '../../../../domain/value-objects/Email';
import { OTPCode } from '../../../../domain/value-objects/OTPCode';
import { Maybe } from '@app/common/src/domain/Maybe';

describe('The LoginAttempt', () => {
  it('stores the provided OTP code when created', () => {
    const email = Email.create('test@example.com');
    const otpCode = OTPCode.generate();

    const attempt = LoginAttempt.create(email, otpCode);

    expect(attempt.email.equals(email)).toBe(true);
    expect(attempt.id).toBeDefined();
    expect(attempt.otpCode.equals(otpCode)).toBe(true);
  });

  it('is valid immediately after creation', () => {
    const attempt = LoginAttempt.create(Email.create('test@example.com'), OTPCode.generate());

    expect(attempt.isExpired()).toBe(false);
  });

  it('expires after 5 minutes', () => {
    const email = Email.create('test@example.com');
    const sixMinutesAgo = new Date(Date.now() - 6 * 60 * 1000);
    const expiredOtp = OTPCode.create('123456', sixMinutesAgo);

    const attempt = LoginAttempt.reconstitute(email, expiredOtp);

    expect(attempt.isExpired()).toBe(true);
  });

  it('validates matching OTP code', () => {
    const otpCode = OTPCode.generate();
    const attempt = LoginAttempt.create(Email.create('test@example.com'), otpCode);

    const code = OTPCode.create(attempt.otpCode.value);

    expect(attempt.verifyCode(code)).toBe(true);
  });

  it('rejects wrong OTP code', () => {
    const attempt = LoginAttempt.create(Email.create('test@example.com'), OTPCode.create('123456'));

    const wrongCode = OTPCode.create('000000');

    expect(attempt.verifyCode(wrongCode)).toBe(false);
  });

  it('rejects expired OTP code even when correct', () => {
    const email = Email.create('test@example.com');
    const sixMinutesAgo = new Date(Date.now() - 6 * 60 * 1000);
    const expiredOtp = OTPCode.create('123456', sixMinutesAgo);
    const attempt = LoginAttempt.reconstitute(email, expiredOtp);

    const correctCode = OTPCode.create('123456');

    expect(attempt.verifyCode(correctCode)).toBe(false);
  });

  it('starts with zero failed attempts', () => {
    const attempt = LoginAttempt.create(Email.create('test@example.com'), OTPCode.generate());

    expect(attempt.getFailedAttempts()).toBe(0);
  });

  it('tracks each failed verification attempt', () => {
    const attempt = LoginAttempt.create(Email.create('test@example.com'), OTPCode.generate());

    attempt.registerFailedAttempt();

    expect(attempt.getFailedAttempts()).toBe(1);
  });

  it('allows verification with fewer than 5 failed attempts', () => {
    const attempt = LoginAttempt.create(Email.create('test@example.com'), OTPCode.generate());
    attempt.registerFailedAttempt();
    attempt.registerFailedAttempt();
    attempt.registerFailedAttempt();
    attempt.registerFailedAttempt();

    expect(attempt.isBlocked()).toBe(false);
  });

  it('blocks verification after 5 failed attempts', () => {
    const attempt = LoginAttempt.create(Email.create('test@example.com'), OTPCode.generate());
    attempt.registerFailedAttempt();
    attempt.registerFailedAttempt();
    attempt.registerFailedAttempt();
    attempt.registerFailedAttempt();
    attempt.registerFailedAttempt();

    expect(attempt.isBlocked()).toBe(true);
  });

  it('lifts the block after 30 minutes cooldown', () => {
    const thirtyOneMinutesAgo = new Date(Date.now() - 31 * 60 * 1000);

    const attempt = LoginAttempt.reconstitute(
      Email.create('test@example.com'),
      OTPCode.create('123456'),
      5,
      Maybe.some(thirtyOneMinutesAgo)
    );

    expect(attempt.isBlocked()).toBe(false);
  });

  it('resets failed attempts counter after 30 minutes cooldown', () => {
    const thirtyOneMinutesAgo = new Date(Date.now() - 31 * 60 * 1000);
    const attempt = LoginAttempt.reconstitute(
      Email.create('test@example.com'),
      OTPCode.create('123456'),
      5,
      Maybe.some(thirtyOneMinutesAgo)
    );

    attempt.registerFailedAttempt();

    expect(attempt.getFailedAttempts()).toBe(1);
  });
});
