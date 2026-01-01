export interface RegisterRequest {
  email: string;
  name: string;
}

export interface LoginRequest {
  email: string;
}

export interface VerifyOTPRequest {
  email: string;
  code: string;
}

export interface UserDTO {
  id: string;
  email: string;
  name?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserDTO;
}

export interface MessageResponse {
  message: string;
}

export interface ErrorResponse {
  error: string;
}

export interface UpdateProfileRequest {
  name: string;
}
