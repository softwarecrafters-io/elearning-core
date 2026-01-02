import { Request, Response } from 'express';
import { GetOrCreateUserUseCase } from '../../application/GetOrCreateUserUseCase';
import { Logger } from '../../../shared/application/ports/Logger';
import { handleError } from '../../../shared/infrastructure/http/handleError';

export class UserWebhookController {
  constructor(
    private getOrCreateUserUseCase: GetOrCreateUserUseCase,
    private logger: Logger
  ) {}

  async createUser(request: Request, response: Response): Promise<void> {
    try {
      const { email, name } = request.body;
      if (!email || typeof email !== 'string') {
        response.status(400).json({ error: 'email is required' });
        return;
      }
      const user = await this.getOrCreateUserUseCase.execute(email, name);
      response.status(200).json(user);
    } catch (error) {
      handleError(error, response, this.logger, 'Webhook');
    }
  }
}
