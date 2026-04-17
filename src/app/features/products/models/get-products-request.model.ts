export interface GetProductsRequest {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  categoryId?: number;
}
