import jwt from 'jsonwebtoken';
import { TokenGenerator } from '../../application/ports/TokenGenerator';
import { Email } from '../../domain/value-objects/Email';
import { Token } from '../../domain/value-objects/Token';

export class JWTTokenGenerator implements TokenGenerator {
  constructor(private secret: string) {}

  generate(email: Email): Token {
    const payload = { email: email.value };
    const tokenValue = jwt.sign(payload, this.secret, { expiresIn: '1h' });
    return Token.create(tokenValue);
  }
}
