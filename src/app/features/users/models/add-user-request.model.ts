export interface AddUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  address?: string;
  phoneNumber?: string;
  userRole?: number;
}
