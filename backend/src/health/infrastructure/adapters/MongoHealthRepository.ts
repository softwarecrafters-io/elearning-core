import { Collection, Db } from 'mongodb';
import { Health } from '../../domain/entities/Health';
import { HealthRepository } from '../../domain/repositories/HealthRepository';
import { Id } from '../../../shared/domain/value-objects/Id';
import { Maybe } from '@app/common/src/domain/Maybe';

interface HealthDocument {
  _id: string;
  createdAt: string;
  lastCheckedAt: string;
}

export class MongoHealthRepository implements HealthRepository {
  private collection: Collection<HealthDocument>;

  constructor(db: Db) {
    this.collection = db.collection<HealthDocument>('health');
  }

  async save(health: Health): Promise<void> {
    const document = this.toDocument(health);
    await this.collection.updateOne({ _id: document._id }, { $set: document }, { upsert: true });
  }

  async find(): Promise<Maybe<Health>> {
    const document = await this.collection.findOne();
    return Maybe.fromNullable(document).map((doc) => this.toDomain(doc));
  }

  private toDocument(health: Health): HealthDocument {
    const primitives = health.toPrimitives();
    return {
      _id: primitives.id,
      createdAt: primitives.createdAt,
      lastCheckedAt: primitives.lastCheckedAt,
    };
  }

  private toDomain(document: HealthDocument): Health {
    return Health.create(Id.create(document._id), new Date(document.createdAt), new Date(document.lastCheckedAt));
  }
}
