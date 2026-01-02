import { Request, Response, NextFunction } from 'express';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { Email } from '../../domain/value-objects/Email';
import { TokenVerifier } from '../../application/ports/TokenVerifier';
import { extractBearerToken } from './AuthMiddleware';

export function createAdminMiddleware(
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
      if (!user.isAdmin()) {
        res.status(403).json({ error: 'Admin access required' });
        return;
      }
      (req as Request & { userId: string }).userId = user.id.value;
      next();
    } catch {
      res.status(401).json({ error: 'Invalid token' });
    }
  };
}
