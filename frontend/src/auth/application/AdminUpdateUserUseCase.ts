import type { UserManagementRepository } from '../domain/repositories/UserManagementRepository';
import type { UserDTO } from './AuthDTO';

export class AdminUpdateUserUseCase {
  constructor(private userManagementRepository: UserManagementRepository) {}

  async execute(id: string, name: string): Promise<UserDTO> {
    const user = await this.userManagementRepository.updateUser(id, name);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
}
