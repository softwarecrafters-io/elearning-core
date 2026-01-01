import { Request, Response, NextFunction } from 'express';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { Email } from '../../domain/value-objects/Email';
import { TokenVerifier } from '../../application/ports/TokenVerifier';
import { Maybe } from '@app/common/src/domain/Maybe';

export function createAuthMiddleware(
  tokenVerifier: TokenVerifier,
  userRepository: UserRepository
): (req: Request, res: Response, next: NextFunction) => Promise<void> {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ error: 'Authorization header required' });
      return;
    }
    const maybeToken = extractBearerToken(authHeader);
    if (maybeToken.isNone()) {
      res.status(401).json({ error: 'Invalid token format' });
      return;
    }
    const token = maybeToken.getOrThrow();
    try {
      const payload = tokenVerifier.verify(token);
      const email = Email.create(payload.email);
      const maybeUser = await userRepository.findByEmail(email);
      if (maybeUser.isNone()) {
        res.status(401).json({ error: 'User not found' });
        return;
      }
      const user = maybeUser.getOrThrow();
      (req as Request & { userId: string }).userId = user.id.value;
      next();
    } catch {
      res.status(401).json({ error: 'Invalid token' });
    }
  };
}

export function extractBearerToken(authHeader: string): Maybe<string> {
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return Maybe.none();
  return Maybe.some(parts[1]);
}
