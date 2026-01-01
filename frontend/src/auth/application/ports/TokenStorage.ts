import { Maybe } from '@app/common/src/domain/Maybe';

export interface TokenStorage {
  saveAccessToken(token: string): void;
  getAccessToken(): Maybe<string>;
  saveRefreshToken(token: string): void;
  getRefreshToken(): Maybe<string>;
  clear(): void;
}

export class InMemoryTokenStorage implements TokenStorage {
  private accessToken: Maybe<string> = Maybe.none();
  private refreshToken: Maybe<string> = Maybe.none();

  saveAccessToken(token: string): void {
    this.accessToken = Maybe.some(token);
  }

  getAccessToken(): Maybe<string> {
    return this.accessToken;
  }

  saveRefreshToken(token: string): void {
    this.refreshToken = Maybe.some(token);
  }

  getRefreshToken(): Maybe<string> {
    return this.refreshToken;
  }

  clear(): void {
    this.accessToken = Maybe.none();
    this.refreshToken = Maybe.none();
  }
}
