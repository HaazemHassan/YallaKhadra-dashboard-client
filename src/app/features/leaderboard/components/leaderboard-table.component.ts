import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { LeaderboardEntryResponse } from '../models/responses/leaderboard-entry-response.model';

@Component({
  selector: 'app-leaderboard-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leaderboard-table.component.html'
})
export class LeaderboardTableComponent {
  @Input({ required: true }) rows: LeaderboardEntryResponse[] = [];

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
}
