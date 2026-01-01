import { Request, Response } from 'express';
import { HealthUseCase } from '../../application/HealthUseCase';
import { Logger } from '../../../shared/application/ports/Logger';
import { DomainError } from '@app/common/src/domain/DomainError';

export class HealthController {
  constructor(
    private healthUseCase: HealthUseCase,
    private logger: Logger
  ) {}

  async check(_request: Request, response: Response): Promise<void> {
    try {
      const result = await this.healthUseCase.execute();
      response.status(200).json(result);
    } catch (error) {
      this.handleError(error, response);
    }
  }

  private handleError(error: unknown, response: Response): void {
    if (error instanceof DomainError) {
      const status = error.type === 'notFound' ? 404 : 400;
      response.status(status).json({ error: error.message });
      return;
    }
    this.logger.error(error, 'Health check failed');
    response.status(500).json({ error: 'Internal server error' });
  }
}
