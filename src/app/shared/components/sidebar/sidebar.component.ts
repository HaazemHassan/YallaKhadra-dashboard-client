import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SidebarItem } from './sidebar-item.interface';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {
  readonly sidebarItems: SidebarItem[] = [
    {
      title: 'Home',
      url: '/dashboard/home'
    },
    {
      title: 'Leaderboard',
      url: '/dashboard/leaderboard'
    },
    {
      title: 'Categories',
      url: '/dashboard/categories'
    },
    {
      title: 'Products',
      url: '/dashboard/products'
    }
  ];

  isMobileSidebarOpen = false;

  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
  }

  closeMobileSidebar(): void {
    this.isMobileSidebarOpen = false;
  }
}
