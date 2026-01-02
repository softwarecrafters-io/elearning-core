import { Request, Response } from 'express';
import { CreateUserUseCase } from '../../application/CreateUserUseCase';
import { ListUsersUseCase } from '../../application/ListUsersUseCase';
import { UpdateUserNameUseCase } from '../../application/UpdateUserNameUseCase';
import { DeleteUserUseCase } from '../../application/DeleteUserUseCase';
import { Logger } from '../../../shared/application/ports/Logger';
import { handleError } from '../../../shared/infrastructure/http/handleError';

export interface AdminRequest extends Request {
  userId: string;
}

export class AdminController {
  constructor(
    private createUserUseCase: CreateUserUseCase,
    private listUsersUseCase: ListUsersUseCase,
    private updateUserNameUseCase: UpdateUserNameUseCase,
    private deleteUserUseCase: DeleteUserUseCase,
    private logger: Logger
  ) {}

  async listUsers(_request: AdminRequest, response: Response): Promise<void> {
    try {
      const users = await this.listUsersUseCase.execute();
      response.json(users);
    } catch (error) {
      handleError(error, response, this.logger, 'Admin');
    }
  }

  async createUser(request: AdminRequest, response: Response): Promise<void> {
    try {
      const { email, name } = request.body;
      if (!email || typeof email !== 'string') {
        response.status(400).json({ error: 'email is required' });
        return;
      }
      const user = await this.createUserUseCase.execute(request.userId, email, name);
      response.status(201).json(user);
    } catch (error) {
      handleError(error, response, this.logger, 'Admin');
    }
  }

  async updateUser(request: AdminRequest, response: Response): Promise<void> {
    try {
      const { id } = request.params;
      const { name } = request.body;
      if (!name || typeof name !== 'string') {
        response.status(400).json({ error: 'name is required' });
        return;
      }
      const user = await this.updateUserNameUseCase.execute(id, name);
      response.json(user);
    } catch (error) {
      handleError(error, response, this.logger, 'Admin');
    }
  }

  async deleteUser(request: AdminRequest, response: Response): Promise<void> {
    try {
      const { id } = request.params;
      await this.deleteUserUseCase.execute(id);
      response.status(204).send();
    } catch (error) {
      handleError(error, response, this.logger, 'Admin');
    }
  }
}
