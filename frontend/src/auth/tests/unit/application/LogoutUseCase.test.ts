import { LogoutUseCase } from '../../../application/LogoutUseCase';
import { InMemoryTokenStorage } from '../../../application/ports/TokenStorage';

describe('The LogoutUseCase', () => {
  const createDependencies = () => {
    const tokenStorage = new InMemoryTokenStorage();
    tokenStorage.saveAccessToken('access-token');
    tokenStorage.saveRefreshToken('refresh-token');
    const useCase = new LogoutUseCase(tokenStorage);
    return { useCase, tokenStorage };
  };

  it('clears both tokens from storage', () => {
    const { useCase, tokenStorage } = createDependencies();

    useCase.execute();

    expect(tokenStorage.getAccessToken().isNone()).toBe(true);
    expect(tokenStorage.getRefreshToken().isNone()).toBe(true);
  });
});
