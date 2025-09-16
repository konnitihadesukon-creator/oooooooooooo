// 共通定数定義

// アプリケーション設定
export const APP_CONFIG = {
  NAME: 'シフトマッチ',
  VERSION: '1.0.0',
  DESCRIPTION: '軽貨物専用シフト管理アプリ',
} as const;

// API設定
export const API_CONFIG = {
  BASE_URL: process.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  TIMEOUT: 30000, // 30秒
  RETRY_COUNT: 3,
} as const;

// 認証設定
export const AUTH_CONFIG = {
  TOKEN_STORAGE_KEY: 'shift_match_token',
  REFRESH_TOKEN_STORAGE_KEY: 'shift_match_refresh_token',
  USER_STORAGE_KEY: 'shift_match_user',
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24時間
} as const;

// ページネーション設定
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// ファイルアップロード設定
export const FILE_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
} as const;

// 日付・時刻設定
export const DATE_CONFIG = {
  DEFAULT_TIMEZONE: 'Asia/Tokyo',
  DATE_FORMAT: 'YYYY-MM-DD',
  DATETIME_FORMAT: 'YYYY-MM-DD HH:mm:ss',
  TIME_FORMAT: 'HH:mm',
  DISPLAY_DATE_FORMAT: 'YYYY年MM月DD日',
  DISPLAY_DATETIME_FORMAT: 'YYYY年MM月DD日 HH:mm',
} as const;

// シフト関連設定
export const SHIFT_CONFIG = {
  // シフト希望提出期限（前月15日）
  REQUEST_DEADLINE_DAY: 15,
  
  // シフト状態
  AVAILABILITY_STATUS: {
    AVAILABLE: '勤務可能',
    UNAVAILABLE: '勤務不可',
    UNDECIDED: '未定',
  } as const,
  
  // デフォルト勤務時間
  DEFAULT_WORK_HOURS: {
    START: '09:00',
    END: '18:00',
  } as const,
} as const;

// 日報関連設定
export const REPORT_CONFIG = {
  // 支払い方式
  PAYMENT_TYPES: {
    PIECE_RATE: '単価制',
    DAILY_RATE: '日当制',
  } as const,
  
  // デフォルト単価項目
  DEFAULT_PIECE_RATE_ITEMS: [
    { name: '配送', unitPrice: 150 },
    { name: 'ピッキング', unitPrice: 100 },
    { name: '仕分け', unitPrice: 120 },
  ] as const,
} as const;

// GPS・位置情報設定
export const LOCATION_CONFIG = {
  // GPS精度（メートル）
  GPS_ACCURACY_THRESHOLD: 100,
  
  // 打刻可能範囲（メートル）
  CLOCK_IN_RADIUS: 500,
  
  // 位置情報更新間隔（ミリ秒）
  LOCATION_UPDATE_INTERVAL: 30000, // 30秒
} as const;

// 通知設定
export const NOTIFICATION_CONFIG = {
  // 通知タイプ
  TYPES: {
    SHIFT_REMINDER: 'シフト提出リマインド',
    SHIFT_PUBLISHED: 'シフト公開通知',
    SHIFT_SHORTAGE: '人員不足通知',
    REPORT_REMINDER: '日報提出リマインド',
    CHAT_MESSAGE: 'チャットメッセージ',
    SYSTEM: 'システム通知',
  } as const,
  
  // リマインダー設定
  SHIFT_REMINDER_DAYS: [7, 3, 1], // シフト期限前の通知日
  REPORT_REMINDER_HOUR: 20, // 日報リマインド時刻（20時）
} as const;

// チャット設定
export const CHAT_CONFIG = {
  MAX_MESSAGE_LENGTH: 1000,
  MAX_FILE_ATTACHMENTS: 5,
  MESSAGE_PAGE_SIZE: 50,
} as const;

// バッジ・ランキング設定
export const GAMIFICATION_CONFIG = {
  // バッジ条件
  BADGE_CONDITIONS: {
    PERFECT_ATTENDANCE: {
      MONTHLY: 30, // 月間皆勤賞
      QUARTERLY: 90, // 四半期皆勤賞
    },
    SALES_TOP: {
      MONTHLY_TOP3: 3, // 月間売上TOP3
      WEEKLY_TOP1: 1, // 週間売上TOP1
    },
    CONSECUTIVE_WORK: {
      WEEK: 7, // 連続7日勤務
      MONTH: 30, // 連続30日勤務
    },
  } as const,
  
  // ランキング更新間隔
  RANKING_UPDATE_INTERVAL: 60 * 60 * 1000, // 1時間
} as const;

// エラーコード
export const ERROR_CODES = {
  // 認証エラー
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_ACCESS_DENIED: 'AUTH_ACCESS_DENIED',
  
  // バリデーションエラー
  VALIDATION_REQUIRED: 'VALIDATION_REQUIRED',
  VALIDATION_INVALID_FORMAT: 'VALIDATION_INVALID_FORMAT',
  VALIDATION_OUT_OF_RANGE: 'VALIDATION_OUT_OF_RANGE',
  
  // リソースエラー
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
  
  // システムエラー
  SYSTEM_DATABASE_ERROR: 'SYSTEM_DATABASE_ERROR',
  SYSTEM_EXTERNAL_API_ERROR: 'SYSTEM_EXTERNAL_API_ERROR',
  SYSTEM_INTERNAL_ERROR: 'SYSTEM_INTERNAL_ERROR',
} as const;

// エラーメッセージ
export const ERROR_MESSAGES = {
  [ERROR_CODES.AUTH_INVALID_CREDENTIALS]: 'メールアドレスまたはパスワードが正しくありません',
  [ERROR_CODES.AUTH_TOKEN_EXPIRED]: 'セッションが期限切れです。再度ログインしてください',
  [ERROR_CODES.AUTH_ACCESS_DENIED]: 'アクセス権限がありません',
  [ERROR_CODES.VALIDATION_REQUIRED]: '必須項目が入力されていません',
  [ERROR_CODES.VALIDATION_INVALID_FORMAT]: '入力形式が正しくありません',
  [ERROR_CODES.VALIDATION_OUT_OF_RANGE]: '入力値が範囲外です',
  [ERROR_CODES.RESOURCE_NOT_FOUND]: 'リソースが見つかりません',
  [ERROR_CODES.RESOURCE_ALREADY_EXISTS]: 'すでに存在します',
  [ERROR_CODES.RESOURCE_CONFLICT]: '競合が発生しました',
  [ERROR_CODES.SYSTEM_DATABASE_ERROR]: 'データベースエラーが発生しました',
  [ERROR_CODES.SYSTEM_EXTERNAL_API_ERROR]: '外部APIでエラーが発生しました',
  [ERROR_CODES.SYSTEM_INTERNAL_ERROR]: 'システムエラーが発生しました',
} as const;

// 成功メッセージ
export const SUCCESS_MESSAGES = {
  SHIFT_REQUEST_SUBMITTED: 'シフト希望を提出しました',
  DAILY_REPORT_SUBMITTED: '日報を提出しました',
  SHIFT_PUBLISHED: 'シフトを公開しました',
  USER_INVITED: 'ユーザーを招待しました',
  PROFILE_UPDATED: 'プロフィールを更新しました',
  PASSWORD_CHANGED: 'パスワードを変更しました',
  SETTINGS_SAVED: '設定を保存しました',
} as const;

// 確認メッセージ
export const CONFIRM_MESSAGES = {
  DELETE_USER: 'ユーザーを削除してもよろしいですか？',
  PUBLISH_SHIFT: 'シフトを公開してもよろしいですか？',
  CANCEL_SHIFT_REQUEST: 'シフト希望をキャンセルしてもよろしいですか？',
  LOGOUT: 'ログアウトしてもよろしいですか？',
} as const;

// ルート定義
export const ROUTES = {
  // 公開ルート
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  
  // 認証必須ルート
  DASHBOARD: '/dashboard',
  
  // 従業員ルート
  EMPLOYEE: {
    SHIFT_REQUEST: '/employee/shift-request',
    SHIFT_VIEW: '/employee/shift-view',
    DAILY_REPORT: '/employee/daily-report',
    ATTENDANCE: '/employee/attendance',
    CHAT: '/employee/chat',
    PROFILE: '/employee/profile',
  },
  
  // 管理者ルート
  ADMIN: {
    EMPLOYEE_MANAGEMENT: '/admin/employees',
    SHIFT_MANAGEMENT: '/admin/shifts',
    REPORT_MANAGEMENT: '/admin/reports',
    LOCATION_MANAGEMENT: '/admin/locations',
    ANALYTICS: '/admin/analytics',
    SETTINGS: '/admin/settings',
  },
} as const;

// ローカルストレージキー
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'shift_match_auth_token',
  REFRESH_TOKEN: 'shift_match_refresh_token',
  USER_DATA: 'shift_match_user_data',
  THEME: 'shift_match_theme',
  LANGUAGE: 'shift_match_language',
  OFFLINE_REPORTS: 'shift_match_offline_reports',
  DRAFT_DATA: 'shift_match_draft_data',
} as const;

// テーマ設定
export const THEME_CONFIG = {
  COLORS: {
    PRIMARY: '#3182CE',
    SECONDARY: '#38A169',
    ACCENT: '#D69E2E',
    ERROR: '#E53E3E',
    WARNING: '#DD6B20',
    SUCCESS: '#38A169',
    INFO: '#3182CE',
  },
  BREAKPOINTS: {
    SM: '30em', // 480px
    MD: '48em', // 768px
    LG: '62em', // 992px
    XL: '80em', // 1280px
  },
} as const;

// 正規表現パターン
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  PHONE: /^[0-9]{10,11}$/,
  POSTAL_CODE: /^\d{3}-\d{4}$/,
} as const;