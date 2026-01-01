import { OTPCode } from '../../../../domain/value-objects/OTPCode';

describe('The OTPCode', () => {
  it('produces a 6-digit code', () => {
    const otp = OTPCode.generate();

    expect(otp.value).toMatch(/^\d{6}$/);
  });

  it('accepts valid 6-digit code', () => {
    const otp = OTPCode.create('123456');

    expect(otp.value).toBe('123456');
  });

  it('requires exactly 6 digits', () => {
    expect(() => OTPCode.create('12345')).toThrow('Invalid OTP code format');
  });

  it('only allows numeric characters', () => {
    expect(() => OTPCode.create('12345a')).toThrow('Invalid OTP code format');
  });

  it('is valid immediately after generation', () => {
    const otp = OTPCode.generate();

    expect(otp.isExpired()).toBe(false);
  });

  it('becomes invalid after 5 minutes', () => {
    const sixMinutesAgo = new Date(Date.now() - 6 * 60 * 1000);
    const otp = OTPCode.create('123456', sixMinutesAgo);

    expect(otp.isExpired()).toBe(true);
  });

  it('considers two codes with same value as equal', () => {
    const otp1 = OTPCode.create('123456');
    const otp2 = OTPCode.create('123456');

    expect(otp1.equals(otp2)).toBe(true);
  });
});
