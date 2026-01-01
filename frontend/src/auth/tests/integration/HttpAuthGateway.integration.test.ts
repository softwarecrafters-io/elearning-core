import { HttpAuthGateway } from '../../infrastructure/adapters/HttpAuthGateway';
import { InMemoryTokenStorage } from '../../application/ports/TokenStorage';
import { HttpClient } from '../../../shared/infrastructure/http/HttpClient';
import { registerUser, getTestOTP, requestOTP } from '../../../shared/tests/integration/testHelper';

describe('The HttpAuthGateway', () => {
  let tokenStorage: InMemoryTokenStorage;
  let gateway: HttpAuthGateway;

  beforeEach(() => {
    tokenStorage = new InMemoryTokenStorage();
    gateway = new HttpAuthGateway(new HttpClient(), tokenStorage);
  });

  describe('requestOTP', () => {
    it('sends OTP successfully for registered user', async () => {
      const email = `integration-${Date.now()}@example.com`;
      await registerUser(email, 'Test User');

      await expect(gateway.requestOTP(email)).resolves.toBeUndefined();
    });

    it('fails to send OTP for unregistered user', async () => {
      const email = `unknown-${Date.now()}@example.com`;

      await expect(gateway.requestOTP(email)).rejects.toThrow();
    });
  });

  describe('verifyOTP', () => {
    it('stores tokens when OTP is valid', async () => {
      const email = `verify-${Date.now()}@example.com`;
      await registerUser(email, 'Test User');
      await requestOTP(email);

      await gateway.verifyOTP(email, getTestOTP());

      expect(tokenStorage.getAccessToken().isSome()).toBe(true);
      expect(tokenStorage.getRefreshToken().isSome()).toBe(true);
    });

    it('fails to verify with invalid OTP', async () => {
      const email = `invalid-${Date.now()}@example.com`;
      await registerUser(email, 'Test User');
      await requestOTP(email);

      await expect(gateway.verifyOTP(email, '000000')).rejects.toThrow();
    });
  });
});
