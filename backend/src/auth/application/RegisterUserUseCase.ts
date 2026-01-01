import { UserRepository } from '../domain/repositories/UserRepository';
import { User } from '../domain/entities/User';
import { Email } from '../domain/value-objects/Email';
import { DomainError } from '@app/common/src/domain/DomainError';

export class RegisterUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(email: string, name: string): Promise<{ id: string; email: string; name: string }> {
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
