export interface UserByRole {
  id: number;
  name: string;
  email: string;
  phoneNumber: string | null;
  address: string | null;
  isLocked: boolean;
  points: number | null;
}

export interface UserProfileImage {
  id: number;
  url: string;
}

export interface UserDetails {
  name: string;
  email: string;
  profileImage: UserProfileImage | null;
  phoneNumber: string | null;
  address: string | null;
  points: number | null;
  pendingReportsCount: number;
  inProgressReportsCount: number;
  doneReportsCount: number;
}

export interface WorkerDetails {
  name: string;
  email: string;
  profileImage: UserProfileImage | null;
  phoneNumber: string | null;
  address: string | null;
  totalCleanups: number;
  avgResponseTime: number;
  totalHours: number;
}

export interface ToggleLockResponse {
  userId: number;
  isLocked: boolean;
}
