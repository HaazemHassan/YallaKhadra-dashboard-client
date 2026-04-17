import { computed, Injectable, signal } from '@angular/core';

import { AuthResult } from '../../features/auth/models/auth-result';
import { AuthUser } from '../../features/auth/models/auth-user';
import { UserRole } from '../enums/user-role.enum';

const USER_STORAGE_KEY = 'yalla-khadra-user';
const ACCESS_TOKEN_STORAGE_KEY = 'yalla-khadra-access-token';

@Injectable({
  providedIn: 'root'
})
export class UserStore {
  private readonly storage = typeof window !== 'undefined' ? window.localStorage : null;
  private readonly userState = signal<AuthUser | null>(null);
  private readonly accessTokenState = signal<string | null>(null);
  private readonly rolesState = signal<UserRole[]>([]);

  readonly user = this.userState.asReadonly();
  readonly accessToken = this.accessTokenState.asReadonly();
  readonly roles = this.rolesState.asReadonly();
  readonly isAuthenticated = computed(() => this.userState() !== null && this.accessTokenState() !== null);

  constructor() {
    this.restoreSession();
  }

  setSession(authResult: AuthResult): void {
    this.userState.set(authResult.user ?? null);
    this.accessTokenState.set(authResult.accessToken ?? null);
    this.rolesState.set(authResult.user?.roles ?? []);

    if (authResult.user && authResult.accessToken) {
      this.persistSession(authResult.user, authResult.accessToken);
    } else {
      this.clearStoredSession();
    }
  }

  clear(): void {
    this.userState.set(null);
    this.accessTokenState.set(null);
    this.rolesState.set([]);
    this.clearStoredSession();
  }

  canAccessAdminDashboard(): boolean {
    const roles = this.rolesState();
    return roles.includes(UserRole.Admin) || roles.includes(UserRole.SuperAdmin);
  }

  private restoreSession(): void {
    if (!this.storage) {
      return;
    }

    const accessToken = this.storage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    const rawUser = this.storage.getItem(USER_STORAGE_KEY);
    if (!accessToken || !rawUser) {
      this.clearStoredSession();
      return;
    }

    try {
      const user = JSON.parse(rawUser) as AuthUser;
      this.userState.set(user);
      this.accessTokenState.set(accessToken);
      this.rolesState.set(user.roles ?? []);
    } catch {
      this.clearStoredSession();
    }
  }

  private persistSession(user: AuthUser, accessToken: string): void {
    if (!this.storage) {
      return;
    }

    this.storage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    this.storage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
  }

  private clearStoredSession(): void {
    if (!this.storage) {
      return;
    }

    this.storage.removeItem(USER_STORAGE_KEY);
    this.storage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  }
}
