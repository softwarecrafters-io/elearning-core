import type { UserRepository } from '../domain/repositories/UserRepository';

interface UserDTO {
  id: string;
  email: string;
  name: string;
  role: string;
}

export class ListUsersUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(): Promise<UserDTO[]> {
    const users = await this.userRepository.findAll();
    return users.map((user) => user.toPrimitives());
  }
}
