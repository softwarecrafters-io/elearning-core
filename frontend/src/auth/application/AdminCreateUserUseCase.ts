import type { UserManagementRepository } from '../domain/repositories/UserManagementRepository';
import type { UserDTO } from './AuthDTO';

export class AdminCreateUserUseCase {
  constructor(private userManagementRepository: UserManagementRepository) {}

  async execute(email: string, name: string): Promise<UserDTO> {
    const user = await this.userManagementRepository.createUser(email, name);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
}
