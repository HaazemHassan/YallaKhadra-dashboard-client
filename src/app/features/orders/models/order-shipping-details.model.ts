export interface OrderShippingDetails {
  fullName: string;
  phoneNumber: string;
  city: string;
  streetAddress: string;
  buildingNumber?: string | null;
  landmark?: string | null;
  shippingNotes?: string | null;
}
