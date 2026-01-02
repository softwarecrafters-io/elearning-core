import type { UserRepository } from '../domain/repositories/UserRepository';
import { Id } from '../../shared/domain/value-objects/Id';

export class DeleteUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(userId: string): Promise<void> {
    await this.userRepository.delete(Id.create(userId));
  }
}
