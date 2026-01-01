import { Email } from '../../domain/value-objects/Email';
import { Token } from '../../domain/value-objects/Token';

export interface TokenGenerator {
  generate(email: Email): Token;
}
