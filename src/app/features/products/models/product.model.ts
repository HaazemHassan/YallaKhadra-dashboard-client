export interface Product {
  id: number;
  name: string;
  description: string;
  pointsCost: number;
  stock: number;
  category: string;
  categoryId?: number;
  images: string[];
}
