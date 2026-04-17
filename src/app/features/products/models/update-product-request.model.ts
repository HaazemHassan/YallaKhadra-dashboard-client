export interface UpdateProductRequest {
  name: string;
  description: string;
  pointsCost: number;
  stock: number;
  categoryId: number;
  images?: File[];
}
