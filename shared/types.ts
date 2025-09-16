// 共通型定義

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'EMPLOYEE';
  companyId: string;
  avatar?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  
  // 生体認証設定
  biometricEnabled: boolean;
  
  // 通知設定
  notificationSettings: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

export interface Company {
  id: string;
  name: string;
  adminId: string;
  settings: {
    shiftDeadline: number; // 前月何日まで
    workingHours: {
      start: string;
      end: string;
    };
    overtimeRate: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Location {
  id: string;
  companyId: string;
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShiftRequest {
  id: string;
  userId: string;
  companyId: string;
  month: string; // YYYY-MM形式
  dates: {
    [date: string]: 'AVAILABLE' | 'UNAVAILABLE' | 'UNDECIDED';
  };
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
}

export interface Shift {
  id: string;
  companyId: string;
  month: string; // YYYY-MM形式
  schedule: {
    [date: string]: {
      [locationId: string]: {
        requiredCount: number;
        assignedUsers: string[];
        isPublic: boolean; // 不足分公開フラグ
        priority?: string; // AIへの優先指示
      };
    };
  };
  status: 'DRAFT' | 'PUBLISHED';
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export type PaymentType = 'PIECE_RATE' | 'DAILY_RATE';

export interface DailyReport {
  id: string;
  userId: string;
  companyId: string;
  date: string; // YYYY-MM-DD形式
  locationId: string;
  paymentType: PaymentType;
  
  // 単価制の場合
  pieceRate?: {
    items: Array<{
      id: string;
      name: string;
      unitPrice: number;
      quantity: number;
      total: number;
    }>;
    totalAmount: number;
  };
  
  // 日当制の場合
  dailyRate?: {
    amount: number;
  };
  
  // 共通フィールド
  photos: string[]; // 画像URL配列
  notes?: string;
  
  // OCRデータ
  ocrData?: {
    text: string;
    confidence: number;
    processedAt: Date;
  };
  
  // オフライン対応
  isOfflineSubmitted: boolean;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Attendance {
  id: string;
  userId: string;
  companyId: string;
  date: string; // YYYY-MM-DD形式
  
  clockIn?: {
    time: Date;
    location: {
      lat: number;
      lng: number;
    };
    address?: string;
  };
  
  clockOut?: {
    time: Date;
    location: {
      lat: number;
      lng: number;
    };
    address?: string;
  };
  
  workingMinutes?: number;
  overtimeMinutes?: number;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface Chat {
  id: string;
  companyId: string;
  type: 'GROUP' | 'DIRECT';
  name?: string;
  participants: string[]; // ユーザーID配列
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  attachments?: string[]; // ファイルURL配列
  readBy: string[]; // 既読ユーザーID配列
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'SHIFT_REMINDER' | 'SHIFT_PUBLISHED' | 'SHIFT_SHORTAGE' | 'REPORT_REMINDER' | 'CHAT_MESSAGE' | 'SYSTEM';
  title: string;
  content: string;
  data?: Record<string, any>; // 追加データ
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: {
    type: 'ATTENDANCE_DAYS' | 'SALES_AMOUNT' | 'PERFECT_ATTENDANCE' | 'TOP_PERFORMER';
    threshold: number;
    period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  };
  createdAt: Date;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: Date;
}

// API レスポンス型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ページネーション
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 認証関連
export interface LoginRequest {
  email: string;
  password: string;
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
  role?: 'ADMIN' | 'EMPLOYEE'; // ユーザーが選択するロール
  companyId?: string; // 招待時に使用
  invitationToken?: string;
}

// OTP関連
export interface OtpRequest {
  email: string;
}

export interface OtpVerifyRequest {
  email: string;
  code: string;
}

// ダッシュボード統計
export interface EmployeeDashboard {
  workingDays: number;
  totalSales: number;
  averageDaily: number;
  monthlyTrend: Array<{
    date: string;
    sales: number;
  }>;
  badges: UserBadge[];
  ranking: {
    position: number;
    total: number;
  };
}

export interface AdminDashboard {
  totalEmployees: number;
  activeEmployees: number;
  totalSales: number;
  shiftFulfillmentRate: number;
  
  locationStats: Array<{
    locationId: string;
    name: string;
    fulfillmentRate: number;
    totalSales: number;
  }>;
  
  employeeRanking: Array<{
    userId: string;
    name: string;
    sales: number;
    workingDays: number;
  }>;
  
  monthlyTrend: Array<{
    date: string;
    sales: number;
    workingDays: number;
  }>;
}

// 外部連携
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'SHIFT' | 'PERSONAL';
  locationId?: string;
}

export interface AccountingSoftExport {
  format: 'CSV' | 'EXCEL' | 'JSON';
  period: {
    start: string; // YYYY-MM-DD
    end: string; // YYYY-MM-DD
  };
  includeFields: string[];
}

// WebSocket イベント型
export interface SocketEvents {
  // チャット
  'join-chat': { chatId: string };
  'leave-chat': { chatId: string };
  'send-message': { chatId: string; content: string; type: Message['type'] };
  'message-received': Message;
  
  // 通知
  'notification': Notification;
  
  // リアルタイム更新
  'shift-updated': { shiftId: string };
  'user-online': { userId: string };
  'user-offline': { userId: string };
}

// エラー型
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

// フォーム型
export interface ShiftRequestForm {
  month: string;
  dates: Record<string, 'AVAILABLE' | 'UNAVAILABLE' | 'UNDECIDED'>;
  comment: string;
}

export interface DailyReportForm {
  date: string;
  locationId: string;
  paymentType: PaymentType;
  pieceRateItems?: Array<{
    name: string;
    unitPrice: number;
    quantity: number;
  }>;
  dailyAmount?: number;
  photos: File[];
  notes: string;
}

// 設定型
export interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    showInRanking: boolean;
    shareLocation: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    language: 'ja' | 'en';
  };
}