export interface AddProductRequest {
  name: string;
  description: string;
  pointsCost: number;
  stock: number;
  categoryId: number;
  images: File[];
}
