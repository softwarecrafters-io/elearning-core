import { Maybe } from '@app/common/src/domain/Maybe';
import type { TokenStorage } from '../../application/ports/TokenStorage';
import { AccessToken, tokenCheckIntervalMs } from '../../domain/value-objects/AccessToken';

type SessionExpiredCallback = () => void;
type RefreshToken = () => Promise<void>;

export class TokenRefreshScheduler {
  private intervalId: Maybe<ReturnType<typeof setInterval>> = Maybe.none();
  private visibilityHandler: Maybe<() => void> = Maybe.none();
  private sessionExpiredCallbacks: Set<SessionExpiredCallback> = new Set();

  constructor(
    private tokenStorage: TokenStorage,
    private refreshToken: RefreshToken,
    private refreshIntervalMs: number = tokenCheckIntervalMs
  ) {}

  start(): void {
    this.checkAndRefresh();
    this.startInterval();
    this.listenToVisibility();
  }

  stop(): void {
    this.intervalId.fold(
      () => {},
      (id) => clearInterval(id)
    );
    this.intervalId = Maybe.none();
    this.visibilityHandler.fold(
      () => {},
      (handler) => document.removeEventListener('visibilitychange', handler)
    );
    this.visibilityHandler = Maybe.none();
  }

  onSessionExpired(callback: SessionExpiredCallback): () => void {
    this.sessionExpiredCallbacks.add(callback);
    return () => this.sessionExpiredCallbacks.delete(callback);
  }

  private startInterval(): void {
    this.intervalId = Maybe.some(setInterval(() => this.checkAndRefresh(), this.refreshIntervalMs));
  }

  private listenToVisibility(): void {
    const handler = () => {
      if (document.visibilityState === 'visible') {
        this.checkAndRefresh();
      }
    };
    this.visibilityHandler = Maybe.some(handler);
    document.addEventListener('visibilitychange', handler);
  }

  private async checkAndRefresh(): Promise<void> {
    this.tokenStorage.getAccessToken().fold(
      () => {},
      (tokenValue) => {
        const accessToken = AccessToken.create(tokenValue);
        if (accessToken.isExpired() || accessToken.isAboutToExpire()) {
          this.refresh();
        }
      }
    );
  }

  private async refresh(): Promise<void> {
    try {
      await this.refreshToken();
    } catch {
      this.tokenStorage.clear();
      this.notifySessionExpired();
    }
  }

  private notifySessionExpired(): void {
    this.sessionExpiredCallbacks.forEach((callback) => callback());
  }
}
