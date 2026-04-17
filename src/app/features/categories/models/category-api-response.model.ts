export interface CategoryApiResponse<T> {
  statusCode?: number;
  meta?: unknown;
  succeeded: boolean;
  message?: string;
  errorCode?: string | null;
  errors?: string[] | null;
  data?: T | null;
}
