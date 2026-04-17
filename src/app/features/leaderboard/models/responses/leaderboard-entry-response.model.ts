export interface LeaderboardEntryResponse {
  userId: number;
  fullName: string;
  profileImageUrl: string | null;
  totalReportsCount: number;
  rank: number;
}
