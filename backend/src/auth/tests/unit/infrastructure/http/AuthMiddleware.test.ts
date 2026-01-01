import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { createAuthMiddleware } from '../../../../infrastructure/http/AuthMiddleware';
import { JWTTokenVerifier } from '../../../../infrastructure/adapters/JWTTokenVerifier';
import { InMemoryUserRepository } from '../../../../domain/repositories/UserRepository';
import { User } from '../../../../domain/entities/User';
import { Email } from '../../../../domain/value-objects/Email';

describe('The AuthMiddleware', () => {
  const secret = 'test-secret';
  const tokenVerifier = new JWTTokenVerifier(secret);

  function createMockRequest(authHeader?: string): Partial<Request> {
    return {
      headers: authHeader ? { authorization: authHeader } : {},
    };
  }

  function createMockResponse(): Partial<Response> {
    const res: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    return res;
  }

  it('adds userId to request for valid token', async () => {
    const user = User.create(Email.create('test@example.com'), 'Test');
    const userRepository = new InMemoryUserRepository();
    await userRepository.save(user);
    const token = jwt.sign({ email: 'test@example.com' }, secret);
    const req = createMockRequest(`Bearer ${token}`) as Request;
    const res = createMockResponse() as Response;
    const next = jest.fn() as NextFunction;
    const middleware = createAuthMiddleware(tokenVerifier, userRepository);

    await middleware(req, res, next);

    expect((req as Request & { userId: string }).userId).toBe(user.id.value);
    expect(next).toHaveBeenCalled();
  });

  it('requires authorization header', async () => {
    const userRepository = new InMemoryUserRepository();
    const req = createMockRequest() as Request;
    const res = createMockResponse() as Response;
    const next = jest.fn() as NextFunction;
    const middleware = createAuthMiddleware(tokenVerifier, userRepository);

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Authorization header required' });
    expect(next).not.toHaveBeenCalled();
  });

  it('does not accept invalid token format', async () => {
    const userRepository = new InMemoryUserRepository();
    const req = createMockRequest('InvalidFormat') as Request;
    const res = createMockResponse() as Response;
    const next = jest.fn() as NextFunction;
    const middleware = createAuthMiddleware(tokenVerifier, userRepository);

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token format' });
    expect(next).not.toHaveBeenCalled();
  });

  it('does not accept invalid token signature', async () => {
    const wrongTokenVerifier = new JWTTokenVerifier('wrong-secret');
    const userRepository = new InMemoryUserRepository();
    const token = jwt.sign({ email: 'test@example.com' }, secret);
    const req = createMockRequest(`Bearer ${token}`) as Request;
    const res = createMockResponse() as Response;
    const next = jest.fn() as NextFunction;
    const middleware = createAuthMiddleware(wrongTokenVerifier, userRepository);

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('requires existing user', async () => {
    const userRepository = new InMemoryUserRepository();
    const token = jwt.sign({ email: 'nonexistent@example.com' }, secret);
    const req = createMockRequest(`Bearer ${token}`) as Request;
    const res = createMockResponse() as Response;
    const next = jest.fn() as NextFunction;
    const middleware = createAuthMiddleware(tokenVerifier, userRepository);

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    expect(next).not.toHaveBeenCalled();
  });
});
