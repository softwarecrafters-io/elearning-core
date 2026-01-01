import { Maybe } from '@app/common/src/domain/Maybe';
import { LoginAttempt } from '../entities/LoginAttempt';
import { Email } from '../value-objects/Email';

export interface LoginAttemptRepository {
  save(attempt: LoginAttempt): Promise<void>;
  findByEmail(email: Email): Promise<Maybe<LoginAttempt>>;
  deleteByEmail(email: Email): Promise<void>;
}

export class InMemoryLoginAttemptRepository implements LoginAttemptRepository {
  private attempts: Map<string, LoginAttempt> = new Map();

  async save(attempt: LoginAttempt): Promise<void> {
    this.attempts.set(attempt.email.value, attempt);
  }

  async findByEmail(email: Email): Promise<Maybe<LoginAttempt>> {
    const attempt = this.attempts.get(email.value);
    return Maybe.fromNullable(attempt);
  }

  async deleteByEmail(email: Email): Promise<void> {
    this.attempts.delete(email.value);
  }

  async findAll(): Promise<LoginAttempt[]> {
    return Array.from(this.attempts.values());
  }
}
