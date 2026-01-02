import { Request, Response } from 'express';
import { CreateUserUseCase } from '../../application/CreateUserUseCase';
import { Logger } from '../../../shared/application/ports/Logger';
import { handleError } from '../../../shared/infrastructure/http/handleError';

export interface AdminRequest extends Request {
  userId: string;
}

export class AdminController {
  constructor(
    private createUserUseCase: CreateUserUseCase,
    private logger: Logger
  ) {}

  async createUser(request: AdminRequest, response: Response): Promise<void> {
    try {
      const { email, name } = request.body;
      if (!email || typeof email !== 'string') {
        response.status(400).json({ error: 'email is required' });
        return;
      }
      const user = await this.createUserUseCase.execute(request.userId, email, name);
      response.status(201).json(user);
    } catch (error) {
      handleError(error, response, this.logger, 'Admin');
    }
  }
}
