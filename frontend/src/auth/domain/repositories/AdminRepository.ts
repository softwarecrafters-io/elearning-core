import { User } from '../entities/User';

export interface AdminRepository {
  listUsers(): Promise<User[]>;
  createUser(email: string, name: string): Promise<User>;
  updateUser(id: string, name: string): Promise<User>;
  deleteUser(id: string): Promise<void>;
}

export class InMemoryAdminRepository implements AdminRepository {
  constructor(private users: User[] = []) {}

  async listUsers(): Promise<User[]> {
    return [...this.users];
  }

  async createUser(email: string, name: string): Promise<User> {
    const id = `user-${Date.now()}`;
    const user = User.create(id, email, name, 'student');
    this.users.push(user);
    return user;
  }

  async updateUser(id: string, name: string): Promise<User> {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) {
      throw new Error(`User ${id} not found`);
    }
    const updated = this.users[index].updateName(name);
    this.users[index] = updated;
    return updated;
  }

  async deleteUser(id: string): Promise<void> {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) {
      throw new Error(`User ${id} not found`);
    }
    this.users.splice(index, 1);
  }
}
