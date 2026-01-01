import { VerifyOTPUseCase } from '../../../application/VerifyOTPUseCase';
import { InMemoryLoginAttemptRepository } from '../../../domain/repositories/LoginAttemptRepository';
import { InMemoryUserRepository } from '../../../domain/repositories/UserRepository';
import { InMemorySessionRepository } from '../../../domain/repositories/SessionRepository';
import { LoginAttempt } from '../../../domain/entities/LoginAttempt';
import { User } from '../../../domain/entities/User';
import { Email } from '../../../domain/value-objects/Email';
import { OTPCode } from '../../../domain/value-objects/OTPCode';
import { RefreshToken } from '../../../domain/value-objects/RefreshToken';
import { JWTTokenGenerator } from '../../../infrastructure/adapters/JWTTokenGenerator';
import { UUIDRefreshTokenGenerator } from '../../../infrastructure/adapters/UUIDRefreshTokenGenerator';
import { Maybe } from '@app/common/src/domain/Maybe';
import { Session } from '../../../domain/entities/Session';

describe('The OTP Verification', () => {
  const createUserAndAttempt = async (deps: ReturnType<typeof createDependencies>) => {
    const email = Email.create('test@example.com');
    const user = User.create(email, 'Test User');
    await deps.userRepository.save(user);
    const attempt = LoginAttempt.create(email, OTPCode.generate());
    await deps.loginAttemptRepository.save(attempt);
    return { email, user, attempt };
  };

  it('grants access token for valid OTP', async () => {
    const deps = createDependencies();
    const { attempt } = await createUserAndAttempt(deps);
    const useCase = createUseCase(deps);

    const result = await useCase.execute('test@example.com', attempt.otpCode.value);

    expect(result.accessToken).toBeDefined();
    expect(result.accessToken.length).toBeGreaterThan(0);
  });

  it('grants refresh token for valid OTP', async () => {
    const deps = createDependencies();
    const { attempt } = await createUserAndAttempt(deps);
    const useCase = createUseCase(deps);

    const result = await useCase.execute('test@example.com', attempt.otpCode.value);

    expect(result.refreshToken).toBeDefined();
    expect(result.refreshToken.length).toBeGreaterThan(0);
  });

  it('creates session on successful verification', async () => {
    const deps = createDependencies();
    const { attempt, user } = await createUserAndAttempt(deps);
    const useCase = createUseCase(deps);

    await useCase.execute('test@example.com', attempt.otpCode.value);

    const session = await deps.sessionRepository.findByUserId(user.id);
    expect(session.isSome()).toBe(true);
  });

  it('invalidates previous session on new login', async () => {
    const deps = createDependencies();
    const { attempt, user } = await createUserAndAttempt(deps);
    const oldSession = Session.create(user.id, RefreshToken.create('old-refresh-token'));
    await deps.sessionRepository.save(oldSession);
    const useCase = createUseCase(deps);

    await useCase.execute('test@example.com', attempt.otpCode.value);

    const oldSessionFound = await deps.sessionRepository.findByRefreshToken(RefreshToken.create('old-refresh-token'));
    expect(oldSessionFound.isNone()).toBe(true);
  });

  it('returns user data with tokens', async () => {
    const deps = createDependencies();
    const { attempt, user } = await createUserAndAttempt(deps);
    const useCase = createUseCase(deps);

    const result = await useCase.execute('test@example.com', attempt.otpCode.value);

    expect(result.user.id).toBe(user.id.value);
    expect(result.user.email).toBe('test@example.com');
    expect(result.user.name).toBe('Test User');
  });

  it('requires an active login attempt', async () => {
    const deps = createDependencies();
    const useCase = createUseCase(deps);

    await expect(useCase.execute('test@example.com', '123456')).rejects.toThrow('No login attempt found');
  });

  it('rejects invalid OTP code', async () => {
    const deps = createDependencies();
    await createUserAndAttempt(deps);
    const useCase = createUseCase(deps);

    await expect(useCase.execute('test@example.com', '000000')).rejects.toThrow('Invalid or expired OTP code');
  });

  it('rejects expired OTP', async () => {
    const deps = createDependencies();
    const email = Email.create('test@example.com');
    const user = User.create(email, 'Test User');
    await deps.userRepository.save(user);
    const sixMinutesAgo = new Date(Date.now() - 6 * 60 * 1000);
    const expiredOtp = OTPCode.create('123456', sixMinutesAgo);
    const attempt = LoginAttempt.reconstitute(email, expiredOtp);
    await deps.loginAttemptRepository.save(attempt);
    const useCase = createUseCase(deps);

    await expect(useCase.execute('test@example.com', '123456')).rejects.toThrow('Invalid or expired OTP code');
  });

  it('clears login attempt after successful verification', async () => {
    const deps = createDependencies();
    const { email, attempt } = await createUserAndAttempt(deps);
    const useCase = createUseCase(deps);

    await useCase.execute('test@example.com', attempt.otpCode.value);

    const found = await deps.loginAttemptRepository.findByEmail(email);
    expect(found.isNone()).toBe(true);
  });

  it('tracks each failed verification attempt', async () => {
    const deps = createDependencies();
    const { email } = await createUserAndAttempt(deps);
    const useCase = createUseCase(deps);

    await expect(useCase.execute('test@example.com', '000000')).rejects.toThrow();

    const found = await deps.loginAttemptRepository.findByEmail(email);
    expect(found.getOrThrow().getFailedAttempts()).toBe(1);
  });

  it('blocks verification after 5 failed attempts', async () => {
    const deps = createDependencies();
    const email = Email.create('test@example.com');
    const user = User.create(email, 'Test User');
    await deps.userRepository.save(user);
    const attempt = LoginAttempt.reconstitute(email, OTPCode.create('123456'), 5, Maybe.some(new Date()));
    await deps.loginAttemptRepository.save(attempt);
    const useCase = createUseCase(deps);

    await expect(useCase.execute('test@example.com', '123456')).rejects.toThrow('Too many failed attempts');
  });
});

function createUseCase(deps: ReturnType<typeof createDependencies>) {
  return new VerifyOTPUseCase(
    deps.loginAttemptRepository,
    deps.userRepository,
    deps.sessionRepository,
    deps.tokenGenerator,
    deps.refreshTokenGenerator
  );
}

function createDependencies() {
  const loginAttemptRepository = new InMemoryLoginAttemptRepository();
  const userRepository = new InMemoryUserRepository();
  const sessionRepository = new InMemorySessionRepository();
  const tokenGenerator = new JWTTokenGenerator('test-secret');
  const refreshTokenGenerator = new UUIDRefreshTokenGenerator();
  return { loginAttemptRepository, userRepository, sessionRepository, tokenGenerator, refreshTokenGenerator };
}
