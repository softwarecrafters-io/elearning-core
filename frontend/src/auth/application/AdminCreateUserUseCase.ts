import type { AdminRepository } from '../domain/repositories/AdminRepository';
import type { UserDTO } from './AuthDTO';

export class AdminCreateUserUseCase {
  constructor(private adminRepository: AdminRepository) {}

  async execute(email: string, name: string): Promise<UserDTO> {
    const user = await this.adminRepository.createUser(email, name);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
}
