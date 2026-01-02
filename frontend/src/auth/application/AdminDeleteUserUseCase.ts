import type { UserManagementRepository } from '../domain/repositories/UserManagementRepository';

export class AdminDeleteUserUseCase {
  constructor(private userManagementRepository: UserManagementRepository) {}

  async execute(id: string): Promise<void> {
    await this.userManagementRepository.deleteUser(id);
  }
}
