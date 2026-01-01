import { OTPCode } from '../../domain/value-objects/OTPCode';

export interface OTPGenerator {
  generate(): OTPCode;
}

export class RandomOTPGenerator implements OTPGenerator {
  generate(): OTPCode {
    return OTPCode.generate();
  }
}

export class FixedOTPGenerator implements OTPGenerator {
  constructor(private readonly fixedCode: string) {}

  generate(): OTPCode {
    return OTPCode.create(this.fixedCode);
  }
}
