import { Request, Response, NextFunction } from 'express';
import { createWebhookAuthMiddleware } from '../../../../infrastructure/http/WebhookAuthMiddleware';

describe('The WebhookAuthMiddleware', () => {
  const secret = 'test-webhook-secret';

  function createMockRequest(webhookSecret?: string): Partial<Request> {
    return {
      headers: webhookSecret ? { 'x-webhook-secret': webhookSecret } : {},
    };
  }

  function createMockResponse(): Partial<Response> {
    const res: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    return res;
  }

  it('calls next if secret is valid', async () => {
    const req = createMockRequest(secret) as Request;
    const res = createMockResponse() as Response;
    const next = jest.fn() as NextFunction;
    const middleware = createWebhookAuthMiddleware(secret);

    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('returns 401 if no X-Webhook-Secret header', async () => {
    const req = createMockRequest() as Request;
    const res = createMockResponse() as Response;
    const next = jest.fn() as NextFunction;
    const middleware = createWebhookAuthMiddleware(secret);

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Webhook secret required' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 if secret is invalid', async () => {
    const req = createMockRequest('wrong-secret') as Request;
    const res = createMockResponse() as Response;
    const next = jest.fn() as NextFunction;
    const middleware = createWebhookAuthMiddleware(secret);

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid webhook secret' });
    expect(next).not.toHaveBeenCalled();
  });
});
