import { Request, Response, NextFunction } from 'express';

export function createWebhookAuthMiddleware(
  secret: string
): (req: Request, res: Response, next: NextFunction) => Promise<void> {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const webhookSecret = req.headers['x-webhook-secret'];
    if (!webhookSecret) {
      res.status(401).json({ error: 'Webhook secret required' });
      return;
    }
    if (webhookSecret !== secret) {
      res.status(401).json({ error: 'Invalid webhook secret' });
      return;
    }
    next();
  };
}
