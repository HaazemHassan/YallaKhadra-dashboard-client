export interface OrderItemDetails {
  id: number;
  productId: number;
  productName: string;
  productDescription: string;
  productMainImageUrl?: string | null;
  quantity: number;
  unitPointsAtPurchase: number;
  totalPoints: number;
}
