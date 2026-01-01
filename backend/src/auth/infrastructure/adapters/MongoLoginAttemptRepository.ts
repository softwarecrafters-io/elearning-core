import { Collection, Db } from 'mongodb';
import { LoginAttempt } from '../../domain/entities/LoginAttempt';
import { LoginAttemptRepository } from '../../domain/repositories/LoginAttemptRepository';
import { Email } from '../../domain/value-objects/Email';
import { OTPCode } from '../../domain/value-objects/OTPCode';
import { Maybe } from '@app/common/src/domain/Maybe';

interface LoginAttemptDocument {
  email: string;
  otpCode: string;
  createdAt: string;
  failedAttempts: number;
  lastFailedAt: string | null;
}

export class MongoLoginAttemptRepository implements LoginAttemptRepository {
  private collection: Collection<LoginAttemptDocument>;

  constructor(db: Db) {
    this.collection = db.collection<LoginAttemptDocument>('login_attempts');
  }

  async save(attempt: LoginAttempt): Promise<void> {
    const document = this.toDocument(attempt);
    await this.collection.updateOne({ email: document.email }, { $set: document }, { upsert: true });
  }

  async findByEmail(email: Email): Promise<Maybe<LoginAttempt>> {
    const document = await this.collection.findOne({ email: email.value });
    return Maybe.fromNullable(document).map((doc) => this.toDomain(doc));
  }

  async deleteByEmail(email: Email): Promise<void> {
    await this.collection.deleteOne({ email: email.value });
  }

  private toDocument(attempt: LoginAttempt): LoginAttemptDocument {
    const lastFailedAt = attempt.getLastFailedAt();
    return {
      email: attempt.email.value,
      otpCode: attempt.otpCode.value,
      createdAt: attempt.otpCode.createdAt.toISOString(),
      failedAttempts: attempt.getFailedAttempts(),
      lastFailedAt: lastFailedAt.isSome() ? lastFailedAt.getOrThrow().toISOString() : null,
    };
  }

  private toDomain(document: LoginAttemptDocument): LoginAttempt {
    const lastFailedAt = document.lastFailedAt ? Maybe.some(new Date(document.lastFailedAt)) : Maybe.none<Date>();
    return LoginAttempt.reconstitute(
      Email.create(document.email),
      OTPCode.create(document.otpCode, new Date(document.createdAt)),
      document.failedAttempts ?? 0,
      lastFailedAt
    );
  }
}
