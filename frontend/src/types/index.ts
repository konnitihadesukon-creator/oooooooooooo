// Temporary local types for frontend until shared module resolution is fixed

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'EMPLOYEE';
  avatar?: string;
  phone?: string;
  isActive: boolean;
  companyId: string;
  biometricEnabled: boolean;
  biometricData?: string;
  notificationSettings: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  createdAt: string;
  updatedAt: string;
  company?: {
    id: string;
    name: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  companyName?: string;
  role?: 'ADMIN' | 'EMPLOYEE';
  invitationToken?: string;
  generateInviteCode?: boolean;
}

// Constants
export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: '/dashboard',
  EMPLOYEE: {
    SHIFT_REQUEST: '/employee/shift-request',
    SHIFT_VIEW: '/employee/shift-view',
    DAILY_REPORT: '/employee/daily-report',
    ATTENDANCE: '/employee/attendance',
    CHAT: '/employee/chat',
    PROFILE: '/employee/profile',
  },
  ADMIN: {
    EMPLOYEE_MANAGEMENT: '/admin/employees',
    SHIFT_MANAGEMENT: '/admin/shifts',
    REPORT_MANAGEMENT: '/admin/reports',
    LOCATION_MANAGEMENT: '/admin/locations',
    ANALYTICS: '/admin/analytics',
    SETTINGS: '/admin/settings',
  },
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'shift_match_auth_token',
  REFRESH_TOKEN: 'shift_match_refresh_token',
  USER_DATA: 'shift_match_user_data',
  THEME: 'shift_match_theme',
  LANGUAGE: 'shift_match_language',
} as const;