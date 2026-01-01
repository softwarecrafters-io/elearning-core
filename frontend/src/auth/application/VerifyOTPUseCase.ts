import type { AuthGateway } from './ports/AuthGateway';

export class VerifyOTPUseCase {
  constructor(private authGateway: AuthGateway) {}

  async execute(email: string, code: string): Promise<void> {
    await this.authGateway.verifyOTP(email, code);
  }
}
