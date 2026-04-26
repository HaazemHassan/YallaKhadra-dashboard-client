export interface UserApiResponse<T> {
  statusCode?: number;
  meta?: unknown;
  succeeded: boolean;
  message?: string;
  errors?: string[] | null;
  data?: T | null;
}
