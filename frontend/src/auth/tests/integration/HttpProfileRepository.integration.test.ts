import { HttpProfileRepository } from '../../infrastructure/adapters/HttpProfileRepository';
import { InMemoryTokenStorage } from '../../application/ports/TokenStorage';
import { AuthenticatedHttpClient } from '../../../shared/infrastructure/http/AuthenticatedHttpClient';
import { HttpClient } from '../../../shared/infrastructure/http/HttpClient';
import { HttpSessionGateway } from '../../infrastructure/adapters/HttpSessionGateway';
import { authenticateUser } from '../../../shared/tests/integration/testHelper';

describe('The HttpProfileRepository', () => {
  let tokenStorage: InMemoryTokenStorage;
  let repository: HttpProfileRepository;

  beforeEach(() => {
    tokenStorage = new InMemoryTokenStorage();
    const httpClient = new HttpClient();
    const sessionGateway = new HttpSessionGateway(httpClient);
    const authenticatedClient = new AuthenticatedHttpClient(httpClient, tokenStorage, sessionGateway);
    repository = new HttpProfileRepository(authenticatedClient);
  });

  describe('getProfile', () => {
    it('retrieves profile for authenticated user', async () => {
      const email = `profile-${Date.now()}@example.com`;
      const name = 'Test User';
      const { accessToken, refreshToken } = await authenticateUser(email, name);
      tokenStorage.saveAccessToken(accessToken);
      tokenStorage.saveRefreshToken(refreshToken);

      const user = await repository.getProfile();

      expect(user.email).toBe(email);
      expect(user.name).toBe(name);
    });

    it('fails when not authenticated', async () => {
      await expect(repository.getProfile()).rejects.toThrow('Not authenticated');
    });
  });

  describe('updateProfile', () => {
    it('updates the user name', async () => {
      const email = `update-${Date.now()}@example.com`;
      const { accessToken, refreshToken } = await authenticateUser(email, 'Original Name');
      tokenStorage.saveAccessToken(accessToken);
      tokenStorage.saveRefreshToken(refreshToken);

      const user = await repository.updateProfile('Updated Name');

      expect(user.name).toBe('Updated Name');
      expect(user.email).toBe(email);
    });
  });
});
