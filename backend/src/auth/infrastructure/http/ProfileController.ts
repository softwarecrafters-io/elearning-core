import { Request, Response } from 'express';
import { GetCurrentUserUseCase } from '../../application/GetCurrentUserUseCase';
import { UpdateUserNameUseCase } from '../../application/UpdateUserNameUseCase';
import { Logger } from '../../../shared/application/ports/Logger';
import { DomainError } from '@app/common/src/domain/DomainError';

export interface AuthenticatedRequest extends Request {
  userId: string;
}

export class ProfileController {
  constructor(
    private getCurrentUserUseCase: GetCurrentUserUseCase,
    private updateUserNameUseCase: UpdateUserNameUseCase,
    private logger: Logger
  ) {}

  async me(request: AuthenticatedRequest, response: Response): Promise<void> {
    try {
      const result = await this.getCurrentUserUseCase.execute(request.userId);
      response.status(200).json(result);
    } catch (error) {
      this.handleError(error, response);
    }
  }

  async updateMe(request: AuthenticatedRequest, response: Response): Promise<void> {
    try {
      const { name } = request.body;
      if (!name || typeof name !== 'string') {
        response.status(400).json({ error: 'name is required' });
        return;
      }
      const result = await this.updateUserNameUseCase.execute(request.userId, name);
      response.status(200).json(result);
    } catch (error) {
      this.handleError(error, response);
    }
  }

  private handleError(error: unknown, response: Response): void {
    if (error instanceof DomainError) {
      const statusMap = {
        notFound: 404,
        validation: 422,
        other: 400,
      };
      const status = statusMap[error.type];
      response.status(status).json({ error: error.message });
      return;
    }
    this.logger.error(error, 'Profile operation failed');
    response.status(500).json({ error: 'Internal server error' });
  }
}
