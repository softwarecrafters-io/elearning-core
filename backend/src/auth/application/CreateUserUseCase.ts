import { UserRepository } from '../domain/repositories/UserRepository';
import { User } from '../domain/entities/User';
import { Email } from '../domain/value-objects/Email';
import { Id } from '../../shared/domain/value-objects/Id';
import { DomainError } from '@app/common/src/domain/DomainError';

export class CreateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(
    creatorId: string,
    email: string,
    name: string
  ): Promise<{ id: string; email: string; name: string; role: string }> {
    const creator = await this.userRepository.findById(Id.create(creatorId));
    if (creator.isNone()) {
      throw DomainError.createNotFound('Creator not found');
    }
    if (!creator.getOrThrow(new Error('Creator not found')).isAdmin()) {
      throw DomainError.createValidation('Only admins can create users');
    }
    const emailVO = Email.create(email);
    const existingUser = await this.userRepository.findByEmail(emailVO);
    if (existingUser.isSome()) {
      throw DomainError.createValidation('User with this email already exists');
    }
    const user = User.create(emailVO, name);
    await this.userRepository.save(user);
    return user.toPrimitives();
  }
}
