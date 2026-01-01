import { Maybe } from '@app/common/src/domain/Maybe';
import type { TokenStorage } from '../../application/ports/TokenStorage';

export class LocalStorageTokenStorage implements TokenStorage {
  private readonly accessTokenKey = 'access_token';
  private readonly refreshTokenKey = 'refresh_token';

  saveAccessToken(token: string): void {
    localStorage.setItem(this.accessTokenKey, token);
  }

  getAccessToken(): Maybe<string> {
    return Maybe.fromNullable(localStorage.getItem(this.accessTokenKey));
  }

  saveRefreshToken(token: string): void {
    localStorage.setItem(this.refreshTokenKey, token);
  }

  getRefreshToken(): Maybe<string> {
    return Maybe.fromNullable(localStorage.getItem(this.refreshTokenKey));
  }

  clear(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
  }
}
