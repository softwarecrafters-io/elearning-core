import type { ProfileRepository } from '../../domain/repositories/ProfileRepository';
import { User } from '../../domain/entities/User';
import { AuthenticatedHttpClient } from '../../../shared/infrastructure/http/AuthenticatedHttpClient';
import { ApiRoutes } from '@app/common/src/infrastructure/api/routes';
import type { UserDTO } from '@app/common/src/infrastructure/api/auth';

export class HttpProfileRepository implements ProfileRepository {
  constructor(private authenticatedClient: AuthenticatedHttpClient) {}

  async getProfile(): Promise<User> {
    const userDTO = await this.authenticatedClient.get<UserDTO>(ApiRoutes.Profile.Me);
    return User.create(userDTO.id, userDTO.email, userDTO.name ?? '');
  }

  async updateProfile(name: string): Promise<User> {
    const userDTO = await this.authenticatedClient.patch<UserDTO>(ApiRoutes.Profile.Me, { name });
    return User.create(userDTO.id, userDTO.email, userDTO.name ?? '');
  }
}
