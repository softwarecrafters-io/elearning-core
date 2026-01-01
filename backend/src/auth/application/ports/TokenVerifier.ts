export interface TokenPayload {
  email: string;
}

export interface TokenVerifier {
  verify(token: string): TokenPayload;
}
