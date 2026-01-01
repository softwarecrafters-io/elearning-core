import { ConsoleEmailSender } from '../../../../infrastructure/adapters/ConsoleEmailSender';
import { Email } from '../../../../domain/value-objects/Email';
import { OTPCode } from '../../../../domain/value-objects/OTPCode';

describe('The ConsoleEmailSender', () => {
  it('logs OTP to console', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    const emailSender = new ConsoleEmailSender();
    const email = Email.create('test@example.com');
    const otp = OTPCode.create('123456');

    await emailSender.sendOTP(email, otp);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('test@example.com'));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('123456'));
    consoleSpy.mockRestore();
  });
});
