import type { AdminRepository } from '../domain/repositories/AdminRepository';

export class AdminDeleteUserUseCase {
  constructor(private adminRepository: AdminRepository) {}

  async execute(id: string): Promise<void> {
    await this.adminRepository.deleteUser(id);
  }
}
