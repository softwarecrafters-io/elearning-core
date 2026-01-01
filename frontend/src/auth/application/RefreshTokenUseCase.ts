import type { TokenStorage } from './ports/TokenStorage';
import type { SessionGateway } from './ports/SessionGateway';

export class RefreshTokenUseCase {
  constructor(
    private tokenStorage: TokenStorage,
    private sessionGateway: SessionGateway
  ) {}

  async execute(): Promise<void> {
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
