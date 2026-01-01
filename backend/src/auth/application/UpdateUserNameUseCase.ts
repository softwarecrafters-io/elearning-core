import { UserRepository } from '../domain/repositories/UserRepository';
import { Id } from '../../shared/domain/value-objects/Id';
import { DomainError } from '@app/common/src/domain/DomainError';
import { UserDTO } from './GetCurrentUserUseCase';

export class UpdateUserNameUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(userId: string, newName: string): Promise<UserDTO> {
    if (!newName || newName.trim() === '') {
      throw DomainError.createValidation('Name cannot be empty');
    }
    const id = Id.create(userId);
    const maybeUser = await this.userRepository.findById(id);
    const user = maybeUser.getOrThrow(DomainError.createNotFound('User not found'));
    user.updateName(newName);
    await this.userRepository.save(user);
    return user.toPrimitives();
  }
}
