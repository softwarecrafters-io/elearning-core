import { Maybe } from '@app/common/src/domain/Maybe';
import { Session } from '../entities/Session';
import { Id } from '../../../shared/domain/value-objects/Id';
import { RefreshToken } from '../value-objects/RefreshToken';

export interface SessionRepository {
  save(session: Session): Promise<void>;
  findByRefreshToken(refreshToken: RefreshToken): Promise<Maybe<Session>>;
  findByUserId(userId: Id): Promise<Maybe<Session>>;
  deleteByUserId(userId: Id): Promise<void>;
  deleteByRefreshToken(refreshToken: RefreshToken): Promise<void>;
}

export class InMemorySessionRepository implements SessionRepository {
  private sessions: Map<string, Session> = new Map();

  constructor(initialSessions: Session[] = []) {
    initialSessions.forEach((session) => this.sessions.set(session.id.value, session));
  }

  async save(session: Session): Promise<void> {
    this.sessions.set(session.id.value, session);
  }

  async findByRefreshToken(refreshToken: RefreshToken): Promise<Maybe<Session>> {
    const session = Array.from(this.sessions.values()).find((s) => s.getRefreshToken().equals(refreshToken));
    return Maybe.fromNullable(session);
  }

  async findByUserId(userId: Id): Promise<Maybe<Session>> {
    const session = Array.from(this.sessions.values()).find((s) => s.userId.equals(userId));
    return Maybe.fromNullable(session);
  }

  async deleteByUserId(userId: Id): Promise<void> {
    const toDelete = Array.from(this.sessions.entries()).filter(([, session]) => session.userId.equals(userId));
    toDelete.forEach(([key]) => this.sessions.delete(key));
  }

  async deleteByRefreshToken(refreshToken: RefreshToken): Promise<void> {
    const toDelete = Array.from(this.sessions.entries()).filter(([, session]) =>
      session.getRefreshToken().equals(refreshToken)
    );
    toDelete.forEach(([key]) => this.sessions.delete(key));
  }
}
