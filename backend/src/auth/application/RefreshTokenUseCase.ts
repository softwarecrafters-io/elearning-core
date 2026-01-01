import { SessionRepository } from '../domain/repositories/SessionRepository';
import { UserRepository } from '../domain/repositories/UserRepository';
import { TokenGenerator } from './ports/TokenGenerator';
import { RefreshTokenGenerator } from './ports/RefreshTokenGenerator';
import { RefreshToken } from '../domain/value-objects/RefreshToken';
import { DomainError } from '@app/common/src/domain/DomainError';

interface RefreshResult {
  accessToken: string;
  refreshToken: string;
}

export class RefreshTokenUseCase {
  constructor(
    private sessionRepository: SessionRepository,
    private userRepository: UserRepository,
    private tokenGenerator: TokenGenerator,
    private refreshTokenGenerator: RefreshTokenGenerator
  ) {}

  async execute(refreshTokenValue: string): Promise<RefreshResult> {
    const refreshToken = RefreshToken.create(refreshTokenValue);
    const session = await this.sessionRepository.findByRefreshToken(refreshToken);
    if (session.isNone()) {
      throw DomainError.createValidation('Invalid or expired session');
    }
    const currentSession = session.getOrThrow();
    if (currentSession.isExpired()) {
      throw DomainError.createValidation('Invalid or expired session');
    }
    const newRefreshToken = this.refreshTokenGenerator.generate();
    currentSession.rotateRefreshToken(newRefreshToken);
    await this.sessionRepository.save(currentSession);
    const user = await this.userRepository.findById(currentSession.userId);
    const accessToken = this.tokenGenerator.generate(user.getOrThrow().email);
    return {
      accessToken: accessToken.value,
      refreshToken: newRefreshToken.value,
    };
  }
}
