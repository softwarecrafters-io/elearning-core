import { SessionRepository } from '../domain/repositories/SessionRepository';
import { Id } from '../../shared/domain/value-objects/Id';

export class LogoutUseCase {
  constructor(private sessionRepository: SessionRepository) {}

  async execute(userId: string): Promise<void> {
    await this.sessionRepository.deleteByUserId(Id.create(userId));
  }
}
