import type { AdminRepository } from '../domain/repositories/AdminRepository';
import type { UserDTO } from './AuthDTO';

export class AdminUpdateUserUseCase {
  constructor(private adminRepository: AdminRepository) {}

  async execute(id: string, name: string): Promise<UserDTO> {
    const user = await this.adminRepository.updateUser(id, name);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
}
