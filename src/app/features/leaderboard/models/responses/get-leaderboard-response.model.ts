import { PaginatedResult } from '../../../../shared/models/paginated-result.model';
import { LeaderboardEntryResponse } from './leaderboard-entry-response.model';

export interface GetLeaderboardResponse extends PaginatedResult<LeaderboardEntryResponse> { }
