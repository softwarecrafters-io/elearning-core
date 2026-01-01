import { User } from '../entities/User';

export interface ProfileRepository {
  getProfile(): Promise<User>;
  updateProfile(name: string): Promise<User>;
}

export class InMemoryProfileRepository implements ProfileRepository {
  constructor(private user: User) {}

  async getProfile(): Promise<User> {
    return this.user;
  }

  async updateProfile(name: string): Promise<User> {
    this.user = this.user.updateName(name);
    return this.user;
  }
}
