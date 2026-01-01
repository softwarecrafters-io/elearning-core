import type { ProfileRepository } from '../domain/repositories/ProfileRepository';
import type { UserDTO } from './AuthDTO';

export class GetProfileUseCase {
  constructor(private profileRepository: ProfileRepository) {}

  async execute(): Promise<UserDTO> {
    const user = await this.profileRepository.getProfile();
    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }
}
