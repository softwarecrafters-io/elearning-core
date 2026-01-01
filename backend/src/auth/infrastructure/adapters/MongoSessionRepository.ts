import { Db, Collection } from 'mongodb';
import { SessionRepository } from '../../domain/repositories/SessionRepository';
import { Session } from '../../domain/entities/Session';
import { Id } from '../../../shared/domain/value-objects/Id';
import { RefreshToken } from '../../domain/value-objects/RefreshToken';
import { Maybe } from '@app/common/src/domain/Maybe';

interface SessionDocument {
  _id: string;
  userId: string;
  refreshToken: string;
  createdAt: Date;
  expiresAt: Date;
  lastActivityAt: Date;
}

export class MongoSessionRepository implements SessionRepository {
  private collection: Collection<SessionDocument>;

  constructor(db: Db) {
    this.collection = db.collection('sessions');
  }

  async save(session: Session): Promise<void> {
    const primitives = session.toPrimitives();
    await this.collection.updateOne(
      { _id: primitives.id },
      {
        $set: {
          _id: primitives.id,
          userId: primitives.userId,
          refreshToken: primitives.refreshToken,
          createdAt: primitives.createdAt,
          expiresAt: primitives.expiresAt,
          lastActivityAt: primitives.lastActivityAt,
        },
      },
      { upsert: true }
    );
  }

  async findByRefreshToken(refreshToken: RefreshToken): Promise<Maybe<Session>> {
    const doc = await this.collection.findOne({ refreshToken: refreshToken.value });
    return Maybe.fromNullable(doc).map((d) => this.toDomain(d));
  }

  async findByUserId(userId: Id): Promise<Maybe<Session>> {
    const doc = await this.collection.findOne({ userId: userId.value });
    return Maybe.fromNullable(doc).map((d) => this.toDomain(d));
  }

  async deleteByUserId(userId: Id): Promise<void> {
    await this.collection.deleteMany({ userId: userId.value });
  }

  async deleteByRefreshToken(refreshToken: RefreshToken): Promise<void> {
    await this.collection.deleteMany({ refreshToken: refreshToken.value });
  }

  private toDomain(doc: SessionDocument): Session {
    return Session.reconstitute(
      Id.create(doc._id),
      Id.create(doc.userId),
      RefreshToken.create(doc.refreshToken),
      doc.createdAt,
      doc.expiresAt,
      doc.lastActivityAt
    );
  }
}
