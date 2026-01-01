import { UserRepository } from '../domain/repositories/UserRepository';
import { Id } from '../../shared/domain/value-objects/Id';
import { DomainError } from '@app/common/src/domain/DomainError';

export interface UserDTO {
  id: string;
  email: string;
  name: string;
}

export class GetCurrentUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(userId: string): Promise<UserDTO> {
    const id = Id.create(userId);
    const maybeUser = await this.userRepository.findById(id);
    const user = maybeUser.getOrThrow(DomainError.createNotFound('User not found'));
    return user.toPrimitives();
  }
}
