import { RefreshTokenGenerator } from '../../application/ports/RefreshTokenGenerator';
import { RefreshToken } from '../../domain/value-objects/RefreshToken';

export class UUIDRefreshTokenGenerator implements RefreshTokenGenerator {
  generate(): RefreshToken {
    return RefreshToken.generate();
  }
}
