import type { AuthGateway } from './ports/AuthGateway';

export class LoginUseCase {
  constructor(private authGateway: AuthGateway) {}

  async execute(email: string): Promise<void> {
    await this.authGateway.requestOTP(email);
  }
}
