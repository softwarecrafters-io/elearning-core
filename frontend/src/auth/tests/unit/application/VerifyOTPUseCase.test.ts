import { VerifyOTPUseCase } from '../../../application/VerifyOTPUseCase';
import type { AuthGateway } from '../../../application/ports/AuthGateway';

describe('The VerifyOTPUseCase', () => {
  it('completes without error when OTP is valid', async () => {
    const authGateway: AuthGateway = {
      requestOTP: jest.fn(),
      verifyOTP: jest.fn().mockResolvedValue(undefined),
    };
    const useCase = new VerifyOTPUseCase(authGateway);

    await expect(useCase.execute('test@example.com', '123456')).resolves.toBeUndefined();
    expect(authGateway.verifyOTP).toHaveBeenCalledWith('test@example.com', '123456');
  });

  it('propagates error when OTP is invalid', async () => {
    const authGateway: AuthGateway = {
      requestOTP: jest.fn(),
      verifyOTP: jest.fn().mockRejectedValue(new Error('Invalid OTP')),
    };
    const useCase = new VerifyOTPUseCase(authGateway);

    await expect(useCase.execute('test@example.com', 'wrong')).rejects.toThrow('Invalid OTP');
  });
});
