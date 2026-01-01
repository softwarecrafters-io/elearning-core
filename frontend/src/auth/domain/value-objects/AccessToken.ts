import { DomainError } from '@app/common/src/domain/DomainError';

export const tokenRefreshBufferMs = 15 * 60 * 1000;
export const tokenCheckIntervalMs = 60 * 1000;

export class AccessToken {
  private constructor(readonly value: string) {}

  static create(value: string): AccessToken {
    if (!value) {
      throw DomainError.createValidation('AccessToken cannot be empty');
    }
    return new AccessToken(value);
  }

  isExpired(): boolean {
    return Date.now() >= this.getExpirationTime();
  }

  isAboutToExpire(): boolean {
    const expiration = this.getExpirationTime();
    return Date.now() + tokenRefreshBufferMs > expiration;
  }

  private getExpirationTime(): number {
    const parts = this.value.split('.');
    if (parts.length !== 3) {
      return 0;
    }
    const payload = JSON.parse(atob(parts[1]));
    return payload.exp * 1000;
  }
}
