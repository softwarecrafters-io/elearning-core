import { Id } from '../../../shared/domain/value-objects/Id';
import { RefreshToken } from '../value-objects/RefreshToken';

export class Session {
  private constructor(
    readonly id: Id,
    readonly userId: Id,
    private currentRefreshToken: RefreshToken,
    readonly createdAt: Date,
    readonly expiresAt: Date,
    private lastActivityAt: Date
  ) {}

  getRefreshToken(): RefreshToken {
    return this.currentRefreshToken;
  }

  static create(userId: Id, refreshToken: RefreshToken): Session {
    const durationDays = 7;
    const now = new Date();
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const expiresAt = new Date(now.getTime() + durationDays * millisecondsPerDay);
    return new Session(Id.generate(), userId, refreshToken, now, expiresAt, now);
  }

  static reconstitute(
    id: Id,
    userId: Id,
    refreshToken: RefreshToken,
    createdAt: Date,
    expiresAt: Date,
    lastActivityAt: Date
  ): Session {
    return new Session(id, userId, refreshToken, createdAt, expiresAt, lastActivityAt);
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  rotateRefreshToken(newToken: RefreshToken): void {
    this.currentRefreshToken = newToken;
  }

  touch(): void {
    this.lastActivityAt = new Date();
  }

  getLastActivityAt(): Date {
    return this.lastActivityAt;
  }

  toPrimitives(): {
    id: string;
    userId: string;
    refreshToken: string;
    createdAt: Date;
    expiresAt: Date;
    lastActivityAt: Date;
  } {
    return {
      id: this.id.value,
      userId: this.userId.value,
      refreshToken: this.currentRefreshToken.value,
      createdAt: this.createdAt,
      expiresAt: this.expiresAt,
      lastActivityAt: this.lastActivityAt,
    };
  }
}
