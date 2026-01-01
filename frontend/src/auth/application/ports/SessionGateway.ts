export interface RefreshResult {
  accessToken: string;
  refreshToken: string;
}

export interface SessionGateway {
  refresh(refreshToken: string): Promise<RefreshResult>;
  logout(accessToken: string): Promise<void>;
}
