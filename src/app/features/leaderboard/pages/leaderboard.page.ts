import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, of, startWith, switchMap } from 'rxjs';
import { LeaderboardPeriod } from '../models/leaderboard-period.enum';
import { LeaderboardEntryResponse } from '../models/responses/leaderboard-entry-response.model';
import { LeaderboardViewState } from '../models/view/leaderboard-view-state.interface';
import { LeaderboardService } from '../services/leaderboard.service';
import { LeaderboardTableComponent } from '../components/leaderboard-table.component';

@Component({
  selector: 'app-leaderboard-page',
  standalone: true,
  imports: [CommonModule, LeaderboardTableComponent],
  templateUrl: './leaderboard.page.html'
})
export class LeaderboardPageComponent {
  private readonly leaderboardService = inject(LeaderboardService);

  readonly periods: Array<{ value: LeaderboardPeriod; label: string }> = [
    { value: LeaderboardPeriod.AllTime, label: 'All Time' },
    { value: LeaderboardPeriod.Yearly, label: 'Yearly' },
    { value: LeaderboardPeriod.Monthly, label: 'Monthly' },
    { value: LeaderboardPeriod.Weekly, label: 'Weekly' }
  ];

  readonly selectedPeriod$ = new BehaviorSubject<LeaderboardPeriod>(LeaderboardPeriod.AllTime);
  selectedPeriod = LeaderboardPeriod.AllTime;

  readonly leaderboardState$: Observable<LeaderboardViewState> = this.selectedPeriod$.pipe(
    switchMap((period) =>
      this.leaderboardService
        .getLeaderboard({
          pageNumber: 1,
          pageSize: 10,
          period
        })
        .pipe(
          map((response) => {
            const rows = response.data ?? [];

            return {
              loading: false,
              error: null,
              rows,
              topThree: rows.slice(0, 3)
            };
          }),
          catchError((error: unknown) =>
            of({
              loading: false,
              error: this.resolveErrorMessage(error),
              rows: [],
              topThree: []
            })
          ),
          startWith({
            loading: true,
            error: null,
            rows: [],
            topThree: []
          })
        )
    )
  );

  setPeriod(period: LeaderboardPeriod): void {
    if (this.selectedPeriod === period) {
      return;
    }

    this.selectedPeriod = period;
    this.selectedPeriod$.next(period);
  }

  getRankBadgeClass(rank: number): string {
    if (rank === 1) {
      return 'bg-amber-100 text-amber-700';
    }

    if (rank === 2) {
      return 'bg-slate-200 text-slate-700';
    }

    if (rank === 3) {
      return 'bg-orange-100 text-orange-700';
    }

    return 'bg-muted text-muted-foreground';
  }

  getInitials(name: string): string {
    if (!name.trim()) {
      return 'NA';
    }

    return name
      .split(' ')
      .filter((chunk) => chunk.length > 0)
      .map((chunk) => chunk[0])
      .join('')
      .toUpperCase();
  }

  private resolveErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message.trim()) {
      return error.message;
    }

    return 'Failed to load leaderboard data. Please try again.';
  }
}
