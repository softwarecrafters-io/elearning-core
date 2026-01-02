import { HttpClient } from '../../infrastructure/http/HttpClient';
import { ApiRoutes } from '@app/common/src/infrastructure/api/routes';

const testOTP = '123456';
const webhookSecret = 'test-webhook-secret';
const httpClient = new HttpClient();

export async function registerUser(email: string, name: string): Promise<void> {
  await httpClient.post(
    ApiRoutes.Webhooks.Users,
    { email, name },
    {
      headers: { 'X-Webhook-Secret': webhookSecret },
    }
  );
}

export async function requestOTP(email: string): Promise<void> {
  await httpClient.post(ApiRoutes.Auth.Login, { email });
}

export function getTestOTP(): string {
  return testOTP;
}

export async function authenticateUser(
  email: string,
  name: string
): Promise<{ accessToken: string; refreshToken: string }> {
  await registerUser(email, name);
  await requestOTP(email);
  return httpClient.post(ApiRoutes.Auth.Verify, { email, code: testOTP });
}
