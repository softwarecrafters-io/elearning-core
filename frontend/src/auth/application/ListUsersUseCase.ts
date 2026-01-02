import type { UserManagementRepository } from '../domain/repositories/UserManagementRepository';
import type { UserDTO } from './AuthDTO';

export class ListUsersUseCase {
  constructor(private userManagementRepository: UserManagementRepository) {}

  async execute(): Promise<UserDTO[]> {
    const users = await this.userManagementRepository.listUsers();
    return users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    }));
  }
}
