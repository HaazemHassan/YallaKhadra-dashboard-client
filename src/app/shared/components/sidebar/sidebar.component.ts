import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { AuthService } from '../../../features/auth/services/auth.service';
import { UserRole } from '../../enums/user-role.enum';
import { UserStore } from '../../services/user-store';
import { SidebarSection } from './sidebar-item.interface';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {
  private readonly authService = inject(AuthService);
  private readonly userStore = inject(UserStore);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);

  readonly sidebarSections: SidebarSection[] = [
    {
      label: 'Overview',
      items: [
        {
          title: 'Home',
          url: '/dashboard/home',
          icon: 'dashboard'
        }
      ]
    },
    {
      label: 'Waste Management',
      items: [
        {
          title: 'Reports',
          url: '/dashboard/reports',
          icon: 'folder'
        }
      ]
    },
    {
      label: 'E-Commerce',
      items: [
        {
          title: 'Categories',
          url: '/dashboard/categories',
          icon: 'folder'
        },
        {
          title: 'Products',
          url: '/dashboard/products',
          icon: 'package'
        },
        {
          title: 'Orders',
          url: '/dashboard/orders',
          icon: 'cart'
        }
      ]
    },
    {
      label: 'Rankings',
      items: [
        {
          title: 'Leaderboard',
          url: '/dashboard/leaderboard',
          icon: 'trophy'
        }
      ]
    },
    {
      label: 'User Management',
      items: [
        {
          title: 'Users',
          url: '/dashboard/users',
          icon: 'users'
        },
        {
          title: 'Workers',
          url: '/dashboard/workers',
          icon: 'users'
        },
        {
          title: 'Admins',
          url: '/dashboard/admins',
          icon: 'users'
        }
      ]
    }
  ];

  isMobileSidebarOpen = false;
  isLoggingOut = false;
  isUserMenuOpen = false;

  get displayName(): string {
    const user = this.userStore.user();
    if (!user) {
      return 'Admin';
    }

    return `${user.firstName} ${user.lastName}`.trim();
  }

  get roleLabel(): string {
    const roles = this.userStore.roles();

    if (roles.includes(UserRole.SuperAdmin)) {
      return 'Super Admin';
    }

    if (roles.includes(UserRole.Admin)) {
      return 'Admin';
    }

    return 'User';
  }

  get userInitials(): string {
    const user = this.userStore.user();
    const firstNameInitial = user?.firstName?.trim()?.charAt(0) ?? 'A';
    const lastNameInitial = user?.lastName?.trim()?.charAt(0) ?? 'D';

    return `${firstNameInitial}${lastNameInitial}`.toUpperCase();
  }

  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
  }

  closeMobileSidebar(): void {
    this.isMobileSidebarOpen = false;
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  closeUserMenu(): void {
    this.isUserMenuOpen = false;
  }

  onLogout(): void {
    if (this.isLoggingOut) {
      return;
    }

    this.isLoggingOut = true;

    this.authService
      .logout()
      .pipe(finalize(() => (this.isLoggingOut = false)))
      .subscribe({
        next: (response) => {
          if (!response.succeeded) {
            this.toastr.error(response.message ?? response.errors?.[0] ?? 'Logout failed.');
            return;
          }

          this.userStore.clear();
          this.closeUserMenu();
          this.closeMobileSidebar();
          this.toastr.success(response.message ?? 'Logged out successfully.');
          void this.router.navigateByUrl('/login');
        },
        error: (error: unknown) => {
          const message = this.resolveErrorMessage(error);
          this.toastr.error(message);
        }
      });
  }

  private resolveErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const apiError = error.error as { message?: string; errors?: string[] } | string | null;

      if (typeof apiError === 'string' && apiError.trim()) {
        return apiError;
      }

      if (apiError && typeof apiError === 'object') {
        if (typeof apiError.message === 'string' && apiError.message.trim()) {
          return apiError.message;
        }

        if (Array.isArray(apiError.errors) && apiError.errors.length > 0) {
          return apiError.errors[0] ?? 'Logout failed.';
        }
      }
    }

    if (error instanceof Error && error.message.trim()) {
      return error.message;
    }

    return 'Logout failed.';
  }
}
