import { Session } from '../../../domain/entities/Session';
import { Id } from '../../../../shared/domain/value-objects/Id';
import { RefreshToken } from '../../../domain/value-objects/RefreshToken';

describe('The Session', () => {
  it('creates with userId and refreshToken', () => {
    const userId = Id.generate();
    const refreshToken = RefreshToken.create('refresh-token-123');

    const session = Session.create(userId, refreshToken);

    expect(session.id).toBeDefined();
    expect(session.userId.equals(userId)).toBe(true);
    expect(session.getRefreshToken().equals(refreshToken)).toBe(true);
  });

  it('is not expired before 7 days', () => {
    const session = Session.create(Id.generate(), RefreshToken.create('token'));

    const isExpired = session.isExpired();

    expect(isExpired).toBe(false);
  });

  it('is expired after 7 days', () => {
    const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
    const sevenDaysAfterCreation = new Date(eightDaysAgo.getTime() + 7 * 24 * 60 * 60 * 1000);
    const session = Session.reconstitute(
      Id.generate(),
      Id.generate(),
      RefreshToken.create('token'),
      eightDaysAgo,
      sevenDaysAfterCreation,
      eightDaysAgo
    );

    const isExpired = session.isExpired();

    expect(isExpired).toBe(true);
  });

  it('rotates refreshToken', () => {
    const session = Session.create(Id.generate(), RefreshToken.create('old-token'));
    const newToken = RefreshToken.create('new-token');

    session.rotateRefreshToken(newToken);

    expect(session.getRefreshToken().equals(newToken)).toBe(true);
  });

  it('updates lastActivityAt on touch', () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const session = Session.reconstitute(
      Id.generate(),
      Id.generate(),
      RefreshToken.create('token'),
      oneHourAgo,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      oneHourAgo
    );
    const beforeTouch = session.getLastActivityAt();

    session.touch();

    expect(session.getLastActivityAt().getTime()).toBeGreaterThan(beforeTouch.getTime());
  });
});
