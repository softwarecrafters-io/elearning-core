import { HttpClient } from './HttpClient';
import type { HttpClientOptions } from './HttpClient';
import { AccessToken } from '../../../auth/domain/value-objects/AccessToken';
import type { TokenStorage } from '../../../auth/application/ports/TokenStorage';
import type { SessionGateway } from '../../../auth/application/ports/SessionGateway';

export class AuthenticatedHttpClient {
  constructor(
    private httpClient: HttpClient,
    private tokenStorage: TokenStorage,
    private sessionGateway: SessionGateway
  ) {}

  async get<T>(path: string, options?: HttpClientOptions): Promise<T> {
    const token = await this.ensureValidToken();
    return this.httpClient.get<T>(path, {
      ...options,
      headers: {
        ...options?.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async post<T>(path: string, body?: unknown, options?: HttpClientOptions): Promise<T> {
    const token = await this.ensureValidToken();
    return this.httpClient.post<T>(path, body, {
      ...options,
      headers: {
        ...options?.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async patch<T>(path: string, body: unknown, options?: HttpClientOptions): Promise<T> {
    const token = await this.ensureValidToken();
    return this.httpClient.patch<T>(path, body, {
      ...options,
      headers: {
        ...options?.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  }

  private async ensureValidToken(): Promise<string> {
    const maybeToken = this.tokenStorage.getAccessToken();
    if (maybeToken.isNone()) {
      throw new Error('Not authenticated');
    }
    const tokenValue = maybeToken.getOrThrow();
    const accessToken = AccessToken.create(tokenValue);
    if (accessToken.isExpired() || accessToken.isAboutToExpire()) {
      try {
        await this.refreshTokens();
        return this.tokenStorage.getAccessToken().getOrThrow();
      } catch (error) {
        this.tokenStorage.clear();
        throw new Error('Session expired, please login again');
      }
    }
    return tokenValue;
  }

  private async refreshTokens(): Promise<void> {
    const maybeRefreshToken = this.tokenStorage.getRefreshToken();
    if (maybeRefreshToken.isNone()) {
      throw new Error('No refresh token available');
    }
    const refreshToken = maybeRefreshToken.getOrThrow();
    const result = await this.sessionGateway.refresh(refreshToken);
    this.tokenStorage.saveAccessToken(result.accessToken);
    this.tokenStorage.saveRefreshToken(result.refreshToken);
  }
}
