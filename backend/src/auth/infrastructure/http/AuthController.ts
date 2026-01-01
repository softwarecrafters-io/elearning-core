import { Request, Response } from 'express';
import { RequestLoginUseCase } from '../../application/RequestLoginUseCase';
import { VerifyOTPUseCase } from '../../application/VerifyOTPUseCase';
import { Logger } from '../../../shared/application/ports/Logger';
import { handleError } from '../../../shared/infrastructure/http/handleError';

export class AuthController {
  constructor(
    private requestLoginUseCase: RequestLoginUseCase,
    private verifyOTPUseCase: VerifyOTPUseCase,
    private logger: Logger
  ) {}

  async login(request: Request, response: Response): Promise<void> {
    try {
      const { email } = request.body;
      if (!email || typeof email !== 'string') {
        response.status(400).json({ error: 'email is required' });
        return;
      }
      await this.requestLoginUseCase.execute(email);
      response.status(200).json({ message: 'OTP sent to email' });
    } catch (error) {
      handleError(error, response, this.logger, 'Auth');
    }
  }

  async verify(request: Request, response: Response): Promise<void> {
    try {
      const { email, code } = request.body;
      if (!email || typeof email !== 'string') {
        response.status(400).json({ error: 'email is required' });
        return;
      }
      if (!code || typeof code !== 'string') {
        response.status(400).json({ error: 'code is required' });
        return;
      }
      const result = await this.verifyOTPUseCase.execute(email, code);
      response.status(200).json(result);
    } catch (error) {
      handleError(error, response, this.logger, 'Auth');
    }
  }
}
