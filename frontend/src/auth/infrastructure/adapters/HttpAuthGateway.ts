import type { AuthGateway } from '../../application/ports/AuthGateway';
import type { TokenStorage } from '../../application/ports/TokenStorage';
import type { HttpClient } from '../../../shared/infrastructure/http/HttpClient';
import { ApiRoutes } from '@app/common/src/infrastructure/api/routes';
import type { AuthResponse } from '@app/common/src/infrastructure/api/auth';

export class HttpAuthGateway implements AuthGateway {
  constructor(
    private httpClient: HttpClient,
    private tokenStorage: TokenStorage
  ) {}

  async requestOTP(email: string): Promise<void> {
    await this.httpClient.post(ApiRoutes.Auth.Login, { email });
  }

  async verifyOTP(email: string, code: string): Promise<void> {
    const data = await this.httpClient.post<AuthResponse>(ApiRoutes.Auth.Verify, { email, code });
    this.tokenStorage.saveAccessToken(data.accessToken);
    this.tokenStorage.saveRefreshToken(data.refreshToken);
  }
}
