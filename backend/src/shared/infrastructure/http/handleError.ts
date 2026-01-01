import { Response } from 'express';
import { Logger } from '../../application/ports/Logger';
import { DomainError } from '@app/common/src/domain/DomainError';

export function handleError(error: unknown, response: Response, logger: Logger, context: string): void {
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
  logger.error(error, `${context} operation failed`);
  response.status(500).json({ error: 'Internal server error' });
}
