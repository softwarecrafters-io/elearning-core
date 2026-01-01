import { Request, Response } from 'express';
import { RefreshTokenUseCase } from '../../application/RefreshTokenUseCase';
import { LogoutUseCase } from '../../application/LogoutUseCase';
import { Logger } from '../../../shared/application/ports/Logger';
import { handleError } from '../../../shared/infrastructure/http/handleError';

export class SessionController {
  constructor(
    private refreshTokenUseCase: RefreshTokenUseCase,
    private logoutUseCase: LogoutUseCase,
    private logger: Logger
  ) {}

  async refresh(request: Request, response: Response): Promise<void> {
    try {
      const { refreshToken } = request.body;
      if (!refreshToken || typeof refreshToken !== 'string') {
        response.status(400).json({ error: 'refreshToken is required' });
        return;
      }
      const result = await this.refreshTokenUseCase.execute(refreshToken);
      response.status(200).json(result);
    } catch (error) {
      handleError(error, response, this.logger, 'Session');
    }
  }

  async logout(request: Request, response: Response): Promise<void> {
    try {
      const userId = (request as Request & { userId: string }).userId;
      await this.logoutUseCase.execute(userId);
      response.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      handleError(error, response, this.logger, 'Session');
    }
  }
}
