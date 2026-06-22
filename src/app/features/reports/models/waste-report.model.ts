export interface ReportImage {
  id: number;
  url: string;
  uploadedAt: string;
}

export interface WasteReport {
  id: number;
  latitude: number;
  longitude: number;
  address: string;
  status: number;
  wasteType: number;
  createdAt: string;
  userId: number;
  userName: string;
  images: ReportImage[];
  finalWasteType: number | null;
  finalWasteTypeName: string | null;
  finalWeightInKg: number | null;
  cleanupImages: ReportImage[];
}

export interface ReportApiResponse<T> {
  statusCode?: number;
  meta?: unknown;
  succeeded: boolean;
  message?: string;
  errors?: string[] | null;
  data?: T | null;
}

export enum ReportStatus {
  Pending = 0,
  InProgress = 1,
  Done = 2
}

export enum WasteType {
  Battery = 0,
  BrownGlass = 1,
  Clothes = 2,
  Biological = 3,
  GreenGlass = 4,
  Paper = 5,
  Trash = 6,
  Shoes = 7,
  WhiteGlass = 8,
  Metal = 9,
  Cardboard = 10,
  Plastic = 11
}

export const REPORT_STATUS_LABELS: Record<number, string> = {
  [ReportStatus.Pending]: 'Pending',
  [ReportStatus.InProgress]: 'In Progress',
  [ReportStatus.Done]: 'Done'
};

export const WASTE_TYPE_LABELS: Record<number, string> = {
  [WasteType.Battery]: 'Battery',
  [WasteType.BrownGlass]: 'Brown Glass',
  [WasteType.Clothes]: 'Clothes',
  [WasteType.Biological]: 'Biological',
  [WasteType.GreenGlass]: 'Green Glass',
  [WasteType.Paper]: 'Paper',
  [WasteType.Trash]: 'Trash',
  [WasteType.Shoes]: 'Shoes',
  [WasteType.WhiteGlass]: 'White Glass',
  [WasteType.Metal]: 'Metal',
  [WasteType.Cardboard]: 'Cardboard',
  [WasteType.Plastic]: 'Plastic'
};
