import { MongoUserRepository } from '../../infrastructure/adapters/MongoUserRepository';
import { User } from '../../domain/entities/User';
import { Email } from '../../domain/value-objects/Email';
import { Factory } from '../../../shared/infrastructure/factory';

describe('The MongoUserRepository', () => {
  let repository: MongoUserRepository;

  beforeAll(async () => {
    await Factory.connectToMongoInMemory();
    repository = new MongoUserRepository(Factory.getMongoClient().db());
  }, 20000);

  afterAll(async () => {
    await Factory.disconnectFromMongo();
  });

  beforeEach(async () => {
    await Factory.getMongoClient().db().dropDatabase();
  });

  it('stores and retrieves user by email', async () => {
    const user = User.create(Email.create('test@example.com'), 'John Doe');

    await repository.save(user);
    const found = await repository.findByEmail(user.email);

    expect(found.isSome()).toBe(true);
    expect(found.getOrThrow().id.equals(user.id)).toBe(true);
  });

  it('indicates absence when user does not exist', async () => {
    const email = Email.create('nonexistent@example.com');

    const found = await repository.findByEmail(email);

    expect(found.isNone()).toBe(true);
  });

  it('updates existing user data', async () => {
    const email = Email.create('test@example.com');
    const originalUser = User.create(email, 'John');
    const updatedUser = User.create(email, 'Jane');

    await repository.save(originalUser);
    await repository.save(updatedUser);
    const found = await repository.findByEmail(email);

    expect(found.getOrThrow().getName()).toBe('Jane');
  });
});
