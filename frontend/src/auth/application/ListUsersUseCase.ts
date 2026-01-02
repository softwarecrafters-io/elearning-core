import type { AdminRepository } from '../domain/repositories/AdminRepository';
import type { UserDTO } from './AuthDTO';

export class ListUsersUseCase {
  constructor(private adminRepository: AdminRepository) {}

  async execute(): Promise<UserDTO[]> {
    const users = await this.adminRepository.listUsers();
    return users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    }));
  }
}
