import { UserRole } from '../../../shared/enums/user-role.enum';

import { AuthUserProfileImage } from './auth-user-profile-image';

export interface AuthUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  pointsBalance: number;
  profileImage?: AuthUserProfileImage | null;
  address?: string;
  phoneNumber?: string;
  roles: UserRole[];
}
