import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { createAdminMiddleware } from '../../../../infrastructure/http/AdminMiddleware';
import { JWTTokenVerifier } from '../../../../infrastructure/adapters/JWTTokenVerifier';
import { InMemoryUserRepository } from '../../../../domain/repositories/UserRepository';
import { User } from '../../../../domain/entities/User';
import { Email } from '../../../../domain/value-objects/Email';

describe('The AdminMiddleware', () => {
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

  it('calls next if user is admin', async () => {
    const admin = User.createAdmin(Email.create('admin@example.com'), 'Admin');
    const userRepository = new InMemoryUserRepository();
    await userRepository.save(admin);
    const token = jwt.sign({ email: 'admin@example.com' }, secret);
    const req = createMockRequest(`Bearer ${token}`) as Request;
    const res = createMockResponse() as Response;
    const next = jest.fn() as NextFunction;
    const middleware = createAdminMiddleware(tokenVerifier, userRepository);

    await middleware(req, res, next);

    expect((req as Request & { userId: string }).userId).toBe(admin.id.value);
    expect(next).toHaveBeenCalled();
  });

  it('returns 401 if no authorization header', async () => {
    const userRepository = new InMemoryUserRepository();
    const req = createMockRequest() as Request;
    const res = createMockResponse() as Response;
    const next = jest.fn() as NextFunction;
    const middleware = createAdminMiddleware(tokenVerifier, userRepository);

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Authorization header required' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 if invalid token', async () => {
    const userRepository = new InMemoryUserRepository();
    const req = createMockRequest('Bearer invalid-token') as Request;
    const res = createMockResponse() as Response;
    const next = jest.fn() as NextFunction;
    const middleware = createAdminMiddleware(tokenVerifier, userRepository);

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 403 if user is not admin', async () => {
    const student = User.create(Email.create('student@example.com'), 'Student');
    const userRepository = new InMemoryUserRepository();
    await userRepository.save(student);
    const token = jwt.sign({ email: 'student@example.com' }, secret);
    const req = createMockRequest(`Bearer ${token}`) as Request;
    const res = createMockResponse() as Response;
    const next = jest.fn() as NextFunction;
    const middleware = createAdminMiddleware(tokenVerifier, userRepository);

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Admin access required' });
    expect(next).not.toHaveBeenCalled();
  });
});
