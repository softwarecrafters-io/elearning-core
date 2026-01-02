import { RequestLoginUseCase } from '../../../application/RequestLoginUseCase';
import { InMemoryUserRepository } from '../../../domain/repositories/UserRepository';
import { InMemoryLoginAttemptRepository } from '../../../domain/repositories/LoginAttemptRepository';
import { User } from '../../../domain/entities/User';
import { Email } from '../../../domain/value-objects/Email';
import { EmailSender } from '../../../application/ports/EmailSender';
import { RandomOTPGenerator } from '../../../application/ports/OTPGenerator';

describe('The RequestLoginUseCase', () => {
  it('initiates login and sends OTP for registered user', async () => {
    const userRepository = new InMemoryUserRepository();
    const loginAttemptRepository = new InMemoryLoginAttemptRepository();
    const emailSender = createSpyEmailSender();
    const otpGenerator = new RandomOTPGenerator();
    const user = User.create(Email.create('test@example.com'), 'John Doe');
    await userRepository.save(user);
    const useCase = new RequestLoginUseCase(userRepository, loginAttemptRepository, emailSender, otpGenerator);

    await useCase.execute('test@example.com');

    const attempt = await loginAttemptRepository.findByEmail(Email.create('test@example.com'));
    expect(attempt.isSome()).toBe(true);
    expect(emailSender.sendOTP).toHaveBeenCalled();
  });

  it('requires user to be registered', async () => {
    const userRepository = new InMemoryUserRepository();
    const loginAttemptRepository = new InMemoryLoginAttemptRepository();
    const emailSender = createSpyEmailSender();
    const otpGenerator = new RandomOTPGenerator();
    const useCase = new RequestLoginUseCase(userRepository, loginAttemptRepository, emailSender, otpGenerator);

    await expect(useCase.execute('nonexistent@example.com')).rejects.toThrow('User not found');
  });

  it('creates admin user automatically when email matches ADMIN_EMAIL', async () => {
    const userRepository = new InMemoryUserRepository();
    const loginAttemptRepository = new InMemoryLoginAttemptRepository();
    const emailSender = createSpyEmailSender();
    const otpGenerator = new RandomOTPGenerator();
    const adminEmail = 'admin@example.com';
    const useCase = new RequestLoginUseCase(
      userRepository,
      loginAttemptRepository,
      emailSender,
      otpGenerator,
      adminEmail
    );

    await useCase.execute(adminEmail);

    const createdUser = await userRepository.findByEmail(Email.create(adminEmail));
    expect(createdUser.isSome()).toBe(true);
    expect(createdUser.getOrThrow(new Error('User not found')).isAdmin()).toBe(true);
    expect(emailSender.sendOTP).toHaveBeenCalled();
  });
});

function createSpyEmailSender(): EmailSender & { sendOTP: jest.Mock } {
  return {
    sendOTP: jest.fn().mockResolvedValue(undefined),
  };
}
