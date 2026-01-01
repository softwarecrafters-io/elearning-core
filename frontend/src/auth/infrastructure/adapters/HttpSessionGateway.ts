import type { SessionGateway, RefreshResult } from '../../application/ports/SessionGateway';
import type { HttpClient } from '../../../shared/infrastructure/http/HttpClient';
import { ApiRoutes } from '@app/common/src/infrastructure/api/routes';

export class HttpSessionGateway implements SessionGateway {
  constructor(private httpClient: HttpClient) {}

  async refresh(refreshToken: string): Promise<RefreshResult> {
    return this.httpClient.post<RefreshResult>(ApiRoutes.Auth.Refresh, { refreshToken });
  }

  async logout(accessToken: string): Promise<void> {
    await this.httpClient.post(ApiRoutes.Auth.Logout, undefined, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }
}
