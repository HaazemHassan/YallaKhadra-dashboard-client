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
  Unknown = 0,
  Plastic = 1,
  Paper = 2,
  Glass = 3,
  Metal = 4,
  Organic = 5,
  Electronic = 6,
  Construction = 9,
  Textile = 10,
  Mixed = 11
}

export const REPORT_STATUS_LABELS: Record<number, string> = {
  [ReportStatus.Pending]: 'Pending',
  [ReportStatus.InProgress]: 'In Progress',
  [ReportStatus.Done]: 'Done'
};

export const WASTE_TYPE_LABELS: Record<number, string> = {
  [WasteType.Unknown]: 'Unknown',
  [WasteType.Plastic]: 'Plastic',
  [WasteType.Paper]: 'Paper',
  [WasteType.Glass]: 'Glass',
  [WasteType.Metal]: 'Metal',
  [WasteType.Organic]: 'Organic',
  [WasteType.Electronic]: 'Electronic',
  [WasteType.Construction]: 'Construction',
  [WasteType.Textile]: 'Textile',
  [WasteType.Mixed]: 'Mixed'
};
