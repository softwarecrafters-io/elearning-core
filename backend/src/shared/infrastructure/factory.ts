import { MongoClient } from 'mongodb';
import { HealthRepository } from '../../health/domain/repositories/HealthRepository';
import { MongoHealthRepository } from '../../health/infrastructure/adapters/MongoHealthRepository';
import { HealthUseCase } from '../../health/application/HealthUseCase';
import { HealthController } from '../../health/infrastructure/http/HealthController';
import { Logger } from '../application/ports/Logger';
import { createPinoLogger } from './adapters/PinoLogger';
import { UserRepository } from '../../auth/domain/repositories/UserRepository';
import { LoginAttemptRepository } from '../../auth/domain/repositories/LoginAttemptRepository';
import { SessionRepository } from '../../auth/domain/repositories/SessionRepository';
import { MongoUserRepository } from '../../auth/infrastructure/adapters/MongoUserRepository';
import { MongoLoginAttemptRepository } from '../../auth/infrastructure/adapters/MongoLoginAttemptRepository';
import { MongoSessionRepository } from '../../auth/infrastructure/adapters/MongoSessionRepository';
import { RequestLoginUseCase } from '../../auth/application/RequestLoginUseCase';
import { VerifyOTPUseCase } from '../../auth/application/VerifyOTPUseCase';
import { RefreshTokenUseCase } from '../../auth/application/RefreshTokenUseCase';
import { LogoutUseCase } from '../../auth/application/LogoutUseCase';
import { GetCurrentUserUseCase } from '../../auth/application/GetCurrentUserUseCase';
import { UpdateUserNameUseCase } from '../../auth/application/UpdateUserNameUseCase';
import { CreateUserUseCase } from '../../auth/application/CreateUserUseCase';
import { GetOrCreateUserUseCase } from '../../auth/application/GetOrCreateUserUseCase';
import { AuthController } from '../../auth/infrastructure/http/AuthController';
import { SessionController } from '../../auth/infrastructure/http/SessionController';
import { ProfileController } from '../../auth/infrastructure/http/ProfileController';
import { AdminController } from '../../auth/infrastructure/http/AdminController';
import { UserWebhookController } from '../../auth/infrastructure/http/UserWebhookController';
import { createAuthMiddleware } from '../../auth/infrastructure/http/AuthMiddleware';
import { createAdminMiddleware } from '../../auth/infrastructure/http/AdminMiddleware';
import { createWebhookAuthMiddleware } from '../../auth/infrastructure/http/WebhookAuthMiddleware';
import { ConsoleEmailSender } from '../../auth/infrastructure/adapters/ConsoleEmailSender';
import { JWTTokenGenerator } from '../../auth/infrastructure/adapters/JWTTokenGenerator';
import { JWTTokenVerifier } from '../../auth/infrastructure/adapters/JWTTokenVerifier';
import { UUIDRefreshTokenGenerator } from '../../auth/infrastructure/adapters/UUIDRefreshTokenGenerator';
import { EmailSender } from '../../auth/application/ports/EmailSender';
import { TokenGenerator } from '../../auth/application/ports/TokenGenerator';
import { TokenVerifier } from '../../auth/application/ports/TokenVerifier';
import { RefreshTokenGenerator } from '../../auth/application/ports/RefreshTokenGenerator';
import { OTPGenerator, RandomOTPGenerator, FixedOTPGenerator } from '../../auth/application/ports/OTPGenerator';

export class Factory {
  private static mongoClient: MongoClient;
  private static mongoMemoryServer: { stop(): Promise<boolean>; getUri(): string } | undefined;
  private static healthRepository: HealthRepository;
  private static userRepository: UserRepository;
  private static loginAttemptRepository: LoginAttemptRepository;
  private static sessionRepository: SessionRepository;
  private static emailSender: EmailSender;
  private static tokenGenerator: TokenGenerator;
  private static tokenVerifier: TokenVerifier;
  private static refreshTokenGenerator: RefreshTokenGenerator;
  private static logger: Logger;

  static getLogger(): Logger {
    if (!this.logger) {
      this.logger = createPinoLogger();
    }
    return this.logger;
  }

  static async connectToMongo(): Promise<void> {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI environment variable is required');
    }
    this.mongoClient = await MongoClient.connect(mongoUri);
  }

  static getMongoClient(): MongoClient {
    if (!this.mongoClient) {
      throw new Error('MongoDB client not connected');
    }
    return this.mongoClient;
  }

  static async disconnectFromMongo(): Promise<void> {
    await this.mongoClient.close();
    if (this.mongoMemoryServer) {
      await this.mongoMemoryServer.stop();
      this.mongoMemoryServer = undefined;
    }
  }

  static async connectToMongoInMemory(): Promise<void> {
    const { MongoMemoryServer } = await import('mongodb-memory-server');

    this.mongoMemoryServer = await MongoMemoryServer.create();
    this.mongoClient = await MongoClient.connect(this.mongoMemoryServer.getUri());
  }

  private static getHealthRepository(): HealthRepository {
    if (!this.healthRepository) {
      this.healthRepository = new MongoHealthRepository(this.mongoClient.db());
    }
    return this.healthRepository;
  }

  private static getUserRepository(): UserRepository {
    if (!this.userRepository) {
      this.userRepository = new MongoUserRepository(this.mongoClient.db());
    }
    return this.userRepository;
  }

  private static getLoginAttemptRepository(): LoginAttemptRepository {
    if (!this.loginAttemptRepository) {
      this.loginAttemptRepository = new MongoLoginAttemptRepository(this.mongoClient.db());
    }
    return this.loginAttemptRepository;
  }

  private static getSessionRepository(): SessionRepository {
    if (!this.sessionRepository) {
      this.sessionRepository = new MongoSessionRepository(this.mongoClient.db());
    }
    return this.sessionRepository;
  }

  private static getEmailSender(): EmailSender {
    if (!this.emailSender) {
      this.emailSender = new ConsoleEmailSender();
    }
    return this.emailSender;
  }

  private static getOTPGenerator(): OTPGenerator {
    const testOTP = process.env.TEST_OTP;
    if (testOTP) {
      return new FixedOTPGenerator(testOTP);
    }
    return new RandomOTPGenerator();
  }

  private static getJwtSecret(): string {
    return process.env.JWT_SECRET || 'default-secret-change-me';
  }

  private static getTokenGenerator(): TokenGenerator {
    if (!this.tokenGenerator) {
      this.tokenGenerator = new JWTTokenGenerator(this.getJwtSecret());
    }
    return this.tokenGenerator;
  }

  private static getTokenVerifier(): TokenVerifier {
    if (!this.tokenVerifier) {
      this.tokenVerifier = new JWTTokenVerifier(this.getJwtSecret());
    }
    return this.tokenVerifier;
  }

  private static getRefreshTokenGenerator(): RefreshTokenGenerator {
    if (!this.refreshTokenGenerator) {
      this.refreshTokenGenerator = new UUIDRefreshTokenGenerator();
    }
    return this.refreshTokenGenerator;
  }

  static createHealthUseCase(): HealthUseCase {
    return new HealthUseCase(this.getHealthRepository());
  }

  static createHealthController(): HealthController {
    return new HealthController(this.createHealthUseCase(), this.getLogger());
  }

  static createRequestLoginUseCase(): RequestLoginUseCase {
    return new RequestLoginUseCase(
      this.getUserRepository(),
      this.getLoginAttemptRepository(),
      this.getEmailSender(),
      this.getOTPGenerator(),
      process.env.ADMIN_EMAIL
    );
  }

  static createVerifyOTPUseCase(): VerifyOTPUseCase {
    return new VerifyOTPUseCase(
      this.getLoginAttemptRepository(),
      this.getUserRepository(),
      this.getSessionRepository(),
      this.getTokenGenerator(),
      this.getRefreshTokenGenerator()
    );
  }

  static createRefreshTokenUseCase(): RefreshTokenUseCase {
    return new RefreshTokenUseCase(
      this.getSessionRepository(),
      this.getUserRepository(),
      this.getTokenGenerator(),
      this.getRefreshTokenGenerator()
    );
  }

  static createLogoutUseCase(): LogoutUseCase {
    return new LogoutUseCase(this.getSessionRepository());
  }

  static createGetCurrentUserUseCase(): GetCurrentUserUseCase {
    return new GetCurrentUserUseCase(this.getUserRepository());
  }

  static createUpdateUserNameUseCase(): UpdateUserNameUseCase {
    return new UpdateUserNameUseCase(this.getUserRepository());
  }

  static createAuthController(): AuthController {
    return new AuthController(this.createRequestLoginUseCase(), this.createVerifyOTPUseCase(), this.getLogger());
  }

  static createSessionController(): SessionController {
    return new SessionController(this.createRefreshTokenUseCase(), this.createLogoutUseCase(), this.getLogger());
  }

  static createProfileController(): ProfileController {
    return new ProfileController(
      this.createGetCurrentUserUseCase(),
      this.createUpdateUserNameUseCase(),
      this.getLogger()
    );
  }

  static createAuthMiddleware() {
    return createAuthMiddleware(this.getTokenVerifier(), this.getUserRepository());
  }

  static createAdminMiddleware() {
    return createAdminMiddleware(this.getTokenVerifier(), this.getUserRepository());
  }

  static createWebhookAuthMiddleware() {
    const secret = process.env.USER_WEBHOOK_SECRET;
    if (!secret) {
      throw new Error('USER_WEBHOOK_SECRET environment variable is required');
    }
    return createWebhookAuthMiddleware(secret);
  }

  static createCreateUserUseCase(): CreateUserUseCase {
    return new CreateUserUseCase(this.getUserRepository());
  }

  static createGetOrCreateUserUseCase(): GetOrCreateUserUseCase {
    return new GetOrCreateUserUseCase(this.getUserRepository());
  }

  static createAdminController(): AdminController {
    return new AdminController(this.createCreateUserUseCase(), this.getLogger());
  }

  static createUserWebhookController(): UserWebhookController {
    return new UserWebhookController(this.createGetOrCreateUserUseCase(), this.getLogger());
  }
}
