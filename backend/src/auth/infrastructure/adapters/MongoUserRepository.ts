import { Collection, Db } from 'mongodb';
import { User } from '../../domain/entities/User';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { Email } from '../../domain/value-objects/Email';
import { UserRole } from '../../domain/value-objects/UserRole';
import { Id } from '../../../shared/domain/value-objects/Id';
import { Maybe } from '@app/common/src/domain/Maybe';

interface UserDocument {
  _id: string;
  email: string;
  name: string;
  role: string;
}

export class MongoUserRepository implements UserRepository {
  private collection: Collection<UserDocument>;

  constructor(db: Db) {
    this.collection = db.collection<UserDocument>('users');
  }

  async save(user: User): Promise<void> {
    const document = this.toDocument(user);
    const { _id, ...updateFields } = document;
    await this.collection.updateOne(
      { email: document.email },
      { $set: updateFields, $setOnInsert: { _id } },
      { upsert: true }
    );
  }

  async findByEmail(email: Email): Promise<Maybe<User>> {
    const document = await this.collection.findOne({ email: email.value });
    return Maybe.fromNullable(document).map((doc) => this.toDomain(doc));
  }

  async findById(id: Id): Promise<Maybe<User>> {
    const document = await this.collection.findOne({ _id: id.value });
    return Maybe.fromNullable(document).map((doc) => this.toDomain(doc));
  }

  private toDocument(user: User): UserDocument {
    const primitives = user.toPrimitives();
    return {
      _id: primitives.id,
      email: primitives.email,
      name: primitives.name,
      role: primitives.role,
    };
  }

  private toDomain(document: UserDocument): User {
    return User.reconstitute(
      Id.create(document._id),
      Email.create(document.email),
      document.name,
      UserRole.create(document.role || 'student')
    );
  }
}
