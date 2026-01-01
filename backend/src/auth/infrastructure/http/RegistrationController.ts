import { Request, Response } from 'express';
import { RegisterUserUseCase } from '../../application/RegisterUserUseCase';
import { Logger } from '../../../shared/application/ports/Logger';
import { handleError } from '../../../shared/infrastructure/http/handleError';

export class RegistrationController {
  constructor(
    private registerUserUseCase: RegisterUserUseCase,
    private logger: Logger
  ) {}

  async register(request: Request, response: Response): Promise<void> {
    try {
      const { email, name } = request.body;
      if (!email || typeof email !== 'string') {
        response.status(400).json({ error: 'email is required' });
        return;
      }
      if (!name || typeof name !== 'string') {
        response.status(400).json({ error: 'name is required' });
        return;
      }
      const result = await this.registerUserUseCase.execute(email, name);
      response.status(201).json(result);
    } catch (error) {
      handleError(error, response, this.logger, 'Registration');
    }
  }
}
