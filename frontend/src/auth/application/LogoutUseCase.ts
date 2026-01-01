import type { TokenStorage } from './ports/TokenStorage';

export class LogoutUseCase {
  constructor(private tokenStorage: TokenStorage) {}

  execute(): void {
    this.tokenStorage.clear();
  }
}
