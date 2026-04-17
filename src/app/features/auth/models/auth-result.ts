import { AuthUser } from './auth-user';

export interface AuthResult {
  accessToken: string;
  user: AuthUser;
  refreshToken?: unknown | null;
}
