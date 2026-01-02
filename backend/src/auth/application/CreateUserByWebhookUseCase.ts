import { UserRepository } from '../domain/repositories/UserRepository';
import { User } from '../domain/entities/User';
import { Email } from '../domain/value-objects/Email';

export class CreateUserByWebhookUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(email: string, name?: string): Promise<{ id: string; email: string; name: string; role: string }> {
    const emailVO = Email.create(email);
    const existingUser = await this.userRepository.findByEmail(emailVO);
    if (existingUser.isSome()) {
      return existingUser.getOrThrow(new Error('User not found')).toPrimitives();
    }
    const user = User.create(emailVO, name || '');
    await this.userRepository.save(user);
    return user.toPrimitives();
  }
}
