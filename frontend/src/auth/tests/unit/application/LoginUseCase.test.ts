import { LoginUseCase } from '../../../application/LoginUseCase';
import type { AuthGateway } from '../../../application/ports/AuthGateway';

describe('The LoginUseCase', () => {
  it('calls authGateway requestOTP', async () => {
    const authGateway: AuthGateway = {
      requestOTP: jest.fn().mockResolvedValue(undefined),
      verifyOTP: jest.fn(),
    };
    const useCase = new LoginUseCase(authGateway);

    await useCase.execute('test@example.com');

    expect(authGateway.requestOTP).toHaveBeenCalledWith('test@example.com');
  });
});
