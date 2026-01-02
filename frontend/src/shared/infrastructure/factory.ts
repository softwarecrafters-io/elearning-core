import type { HealthRepository } from '../../health/domain/repositories/HealthRepository';
import { HttpHealthRepository } from '../../health/infrastructure/adapters/HttpHealthRepository';
import { HealthUseCase } from '../../health/application/HealthUseCase';
import type { AuthGateway } from '../../auth/application/ports/AuthGateway';
import { HttpAuthGateway } from '../../auth/infrastructure/adapters/HttpAuthGateway';
import type { ProfileRepository } from '../../auth/domain/repositories/ProfileRepository';
import { HttpProfileRepository } from '../../auth/infrastructure/adapters/HttpProfileRepository';
import type { AdminRepository } from '../../auth/domain/repositories/AdminRepository';
import { HttpAdminRepository } from '../../auth/infrastructure/adapters/HttpAdminRepository';
import type { TokenStorage } from '../../auth/application/ports/TokenStorage';
import { LocalStorageTokenStorage } from '../../auth/infrastructure/adapters/LocalStorageTokenStorage';
import type { SessionGateway } from '../../auth/application/ports/SessionGateway';
import { HttpSessionGateway } from '../../auth/infrastructure/adapters/HttpSessionGateway';
import { LoginUseCase } from '../../auth/application/LoginUseCase';
import { VerifyOTPUseCase } from '../../auth/application/VerifyOTPUseCase';
import { GetProfileUseCase } from '../../auth/application/GetProfileUseCase';
import { UpdateProfileUseCase } from '../../auth/application/UpdateProfileUseCase';
import { LogoutUseCase } from '../../auth/application/LogoutUseCase';
import { RefreshTokenUseCase } from '../../auth/application/RefreshTokenUseCase';
import { ListUsersUseCase } from '../../auth/application/ListUsersUseCase';
import { AdminCreateUserUseCase } from '../../auth/application/AdminCreateUserUseCase';
import { AdminUpdateUserUseCase } from '../../auth/application/AdminUpdateUserUseCase';
import { AdminDeleteUserUseCase } from '../../auth/application/AdminDeleteUserUseCase';
import { HttpClient } from './http/HttpClient';
import { AuthenticatedHttpClient } from './http/AuthenticatedHttpClient';
import { TokenRefreshScheduler } from '../../auth/infrastructure/services/TokenRefreshScheduler';

export class Factory {
  private static httpClient: HttpClient;
  private static healthRepository: HealthRepository;
  private static authGateway: AuthGateway;
  private static profileRepository: ProfileRepository;
  private static adminRepository: AdminRepository;
  private static tokenStorage: TokenStorage;
  private static sessionGateway: SessionGateway;
  private static authenticatedHttpClient: AuthenticatedHttpClient;
  private static tokenRefreshScheduler: TokenRefreshScheduler;

  private static getHttpClient(): HttpClient {
    if (!this.httpClient) {
      this.httpClient = new HttpClient();
    }
    return this.httpClient;
  }

  private static getHealthRepository(): HealthRepository {
    if (!this.healthRepository) {
      this.healthRepository = new HttpHealthRepository(this.getHttpClient());
    }
    return this.healthRepository;
  }

  private static getAuthGateway(): AuthGateway {
    if (!this.authGateway) {
      this.authGateway = new HttpAuthGateway(this.getHttpClient(), this.createTokenStorage());
    }
    return this.authGateway;
  }

  private static getSessionGateway(): SessionGateway {
    if (!this.sessionGateway) {
      this.sessionGateway = new HttpSessionGateway(this.getHttpClient());
    }
    return this.sessionGateway;
  }

  private static getAuthenticatedHttpClient(): AuthenticatedHttpClient {
    if (!this.authenticatedHttpClient) {
      this.authenticatedHttpClient = new AuthenticatedHttpClient(
        this.getHttpClient(),
        this.createTokenStorage(),
        this.getSessionGateway()
      );
    }
    return this.authenticatedHttpClient;
  }

  private static getProfileRepository(): ProfileRepository {
    if (!this.profileRepository) {
      this.profileRepository = new HttpProfileRepository(this.getAuthenticatedHttpClient());
    }
    return this.profileRepository;
  }

  private static getAdminRepository(): AdminRepository {
    if (!this.adminRepository) {
      this.adminRepository = new HttpAdminRepository(this.getAuthenticatedHttpClient());
    }
    return this.adminRepository;
  }

  static createTokenStorage(): TokenStorage {
    if (!this.tokenStorage) {
      this.tokenStorage = new LocalStorageTokenStorage();
    }
    return this.tokenStorage;
  }

  static createHealthUseCase(): HealthUseCase {
    return new HealthUseCase(this.getHealthRepository());
  }

  static createLoginUseCase(): LoginUseCase {
    return new LoginUseCase(this.getAuthGateway());
  }

  static createVerifyOTPUseCase(): VerifyOTPUseCase {
    return new VerifyOTPUseCase(this.getAuthGateway());
  }

  static createGetProfileUseCase(): GetProfileUseCase {
    return new GetProfileUseCase(this.getProfileRepository());
  }

  static createUpdateProfileUseCase(): UpdateProfileUseCase {
    return new UpdateProfileUseCase(this.getProfileRepository());
  }

  static createLogoutUseCase(): LogoutUseCase {
    return new LogoutUseCase(this.createTokenStorage());
  }

  static createRefreshTokenUseCase(): RefreshTokenUseCase {
    return new RefreshTokenUseCase(this.createTokenStorage(), this.getSessionGateway());
  }

  static createTokenRefreshScheduler(): TokenRefreshScheduler {
    if (!this.tokenRefreshScheduler) {
      const refreshTokenUseCase = this.createRefreshTokenUseCase();
      this.tokenRefreshScheduler = new TokenRefreshScheduler(this.createTokenStorage(), () =>
        refreshTokenUseCase.execute()
      );
    }
    return this.tokenRefreshScheduler;
  }

  static createListUsersUseCase(): ListUsersUseCase {
    return new ListUsersUseCase(this.getAdminRepository());
  }

  static createAdminCreateUserUseCase(): AdminCreateUserUseCase {
    return new AdminCreateUserUseCase(this.getAdminRepository());
  }

  static createAdminUpdateUserUseCase(): AdminUpdateUserUseCase {
    return new AdminUpdateUserUseCase(this.getAdminRepository());
  }

  static createAdminDeleteUserUseCase(): AdminDeleteUserUseCase {
    return new AdminDeleteUserUseCase(this.getAdminRepository());
  }
}
