import type { ProfileRepository } from '../domain/repositories/ProfileRepository';
import type { UserDTO } from './AuthDTO';

export class UpdateProfileUseCase {
  constructor(private profileRepository: ProfileRepository) {}

  async execute(name: string): Promise<UserDTO> {
    const user = await this.profileRepository.updateProfile(name);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }
}
