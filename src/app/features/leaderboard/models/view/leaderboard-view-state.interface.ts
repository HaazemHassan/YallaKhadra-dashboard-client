import { LeaderboardEntryResponse } from '../responses/leaderboard-entry-response.model';

export interface LeaderboardViewState {
  loading: boolean;
  error: string | null;
  rows: LeaderboardEntryResponse[];
  topThree: LeaderboardEntryResponse[];
}
