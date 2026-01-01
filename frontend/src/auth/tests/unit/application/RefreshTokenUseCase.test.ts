import { RefreshTokenUseCase } from '../../../application/RefreshTokenUseCase';
import { InMemoryTokenStorage } from '../../../application/ports/TokenStorage';
import type { SessionGateway } from '../../../application/ports/SessionGateway';

describe('The RefreshTokenUseCase', () => {
  const createDependencies = () => {
    const tokenStorage = new InMemoryTokenStorage();
    tokenStorage.saveRefreshToken('old-refresh-token');
    const sessionGateway: SessionGateway = {
      refresh: jest.fn().mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      }),
      logout: jest.fn(),
    };
    const useCase = new RefreshTokenUseCase(tokenStorage, sessionGateway);
    return { useCase, tokenStorage, sessionGateway };
  };

  it('updates tokens in storage on successful refresh', async () => {
    const { useCase, tokenStorage } = createDependencies();

    await useCase.execute();

    expect(tokenStorage.getAccessToken().isSome()).toBe(true);
    expect(tokenStorage.getRefreshToken().getOrElse('')).not.toBe('old-refresh-token');
  });

  it('throws error when no refresh token exists', async () => {
    const tokenStorage = new InMemoryTokenStorage();
    const sessionGateway: SessionGateway = {
      refresh: jest.fn(),
      logout: jest.fn(),
    };
    const useCase = new RefreshTokenUseCase(tokenStorage, sessionGateway);

    await expect(useCase.execute()).rejects.toThrow('No refresh token available');
  });
});
