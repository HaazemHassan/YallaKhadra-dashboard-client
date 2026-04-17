import { LeaderboardPeriod } from '../leaderboard-period.enum';

export interface GetLeaderboardRequest {
  pageNumber?: number;
  pageSize?: number;
  period?: LeaderboardPeriod;
}
