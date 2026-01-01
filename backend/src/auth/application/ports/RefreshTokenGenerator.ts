import { RefreshToken } from '../../domain/value-objects/RefreshToken';

export interface RefreshTokenGenerator {
  generate(): RefreshToken;
}
