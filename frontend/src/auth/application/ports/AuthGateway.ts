export interface AuthGateway {
  requestOTP(email: string): Promise<void>;
  verifyOTP(email: string, code: string): Promise<void>;
}
