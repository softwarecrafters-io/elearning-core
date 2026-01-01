import jwt from 'jsonwebtoken';
import { TokenVerifier, TokenPayload } from '../../application/ports/TokenVerifier';

export class JWTTokenVerifier implements TokenVerifier {
  constructor(private secret: string) {}

  verify(token: string): TokenPayload {
    return jwt.verify(token, this.secret) as TokenPayload;
  }
}
