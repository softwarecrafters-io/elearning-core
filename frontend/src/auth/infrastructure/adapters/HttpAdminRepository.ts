import type { AdminRepository } from '../../domain/repositories/AdminRepository';
import { User } from '../../domain/entities/User';
import { AuthenticatedHttpClient } from '../../../shared/infrastructure/http/AuthenticatedHttpClient';
import { ApiRoutes } from '@app/common/src/infrastructure/api/routes';
import type { UserDTO } from '@app/common/src/infrastructure/api/auth';

export class HttpAdminRepository implements AdminRepository {
  constructor(private authenticatedClient: AuthenticatedHttpClient) {}

  async listUsers(): Promise<User[]> {
    const users = await this.authenticatedClient.get<UserDTO[]>(ApiRoutes.Admin.Users);
    return users.map((u) => User.create(u.id, u.email, u.name ?? '', u.role));
  }

  async createUser(email: string, name: string): Promise<User> {
    const user = await this.authenticatedClient.post<UserDTO>(ApiRoutes.Admin.Users, { email, name });
    return User.create(user.id, user.email, user.name ?? '', user.role);
  }

  async updateUser(id: string, name: string): Promise<User> {
    const user = await this.authenticatedClient.patch<UserDTO>(ApiRoutes.Admin.User(id), { name });
    return User.create(user.id, user.email, user.name ?? '', user.role);
  }

  async deleteUser(id: string): Promise<void> {
    await this.authenticatedClient.delete(ApiRoutes.Admin.User(id));
  }
}
