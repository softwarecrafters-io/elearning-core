import { HttpSessionGateway } from '../../infrastructure/adapters/HttpSessionGateway';
import { HttpClient } from '../../../shared/infrastructure/http/HttpClient';
import { authenticateUser } from '../../../shared/tests/integration/testHelper';

describe('The HttpSessionGateway', () => {
  let gateway: HttpSessionGateway;

  beforeEach(() => {
    gateway = new HttpSessionGateway(new HttpClient());
  });

  describe('refresh', () => {
    it('renews tokens with valid refresh token', async () => {
      const email = `refresh-${Date.now()}@example.com`;
      const { refreshToken } = await authenticateUser(email, 'Test User');

      const result = await gateway.refresh(refreshToken);

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.refreshToken).not.toBe(refreshToken);
    });

    it('fails to refresh with invalid token', async () => {
      await expect(gateway.refresh('invalid-token')).rejects.toThrow();
    });
  });

  describe('logout', () => {
    it('invalidates the session', async () => {
      const email = `logout-${Date.now()}@example.com`;
      const { accessToken, refreshToken } = await authenticateUser(email, 'Test User');

      await gateway.logout(accessToken);

      await expect(gateway.refresh(refreshToken)).rejects.toThrow();
    });
  });
});
