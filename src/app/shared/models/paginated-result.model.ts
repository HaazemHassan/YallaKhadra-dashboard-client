export interface PaginatedResult<T> {
  data: T[] | null;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  meta: unknown;
  pageSize: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  messages: string[] | null;
  succeeded: boolean;
}
