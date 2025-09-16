// 共通ユーティリティ関数

import { DATE_CONFIG, REGEX_PATTERNS } from './constants';

/**
 * 日付フォーマット関数
 */
export const formatDate = {
  // YYYY-MM-DD形式
  toISOString: (date: Date | string): string => {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  },
  
  // 日本語表示形式
  toJapanese: (date: Date | string): string => {
    const d = new Date(date);
    return d.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },
  
  // 時刻付き日本語表示
  toJapaneseDateTime: (date: Date | string): string => {
    const d = new Date(date);
    return d.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },
  
  // 曜日付き表示
  withWeekday: (date: Date | string): string => {
    const d = new Date(date);
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const weekday = weekdays[d.getDay()];
    return `${formatDate.toJapanese(d)} (${weekday})`;
  },
  
  // 月の範囲を取得
  getMonthRange: (year: number, month: number): { start: Date; end: Date } => {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);
    return { start, end };
  },
  
  // 月の日数を取得
  getDaysInMonth: (year: number, month: number): number => {
    return new Date(year, month, 0).getDate();
  },
  
  // 月の全日付配列を取得
  getMonthDates: (year: number, month: number): string[] => {
    const days = formatDate.getDaysInMonth(year, month);
    return Array.from({ length: days }, (_, i) => {
      const day = i + 1;
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    });
  },
};

/**
 * バリデーション関数
 */
export const validation = {
  // メールアドレス
  email: (email: string): boolean => {
    return REGEX_PATTERNS.EMAIL.test(email);
  },
  
  // パスワード強度（8文字以上、大文字小文字数字記号を含む）
  password: (password: string): boolean => {
    return REGEX_PATTERNS.PASSWORD.test(password);
  },
  
  // 電話番号
  phone: (phone: string): boolean => {
    return REGEX_PATTERNS.PHONE.test(phone);
  },
  
  // 必須チェック
  required: (value: any): boolean => {
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return value !== null && value !== undefined;
  },
  
  // 数値範囲チェック
  numberRange: (value: number, min: number, max: number): boolean => {
    return value >= min && value <= max;
  },
  
  // 文字列長チェック
  stringLength: (value: string, min: number, max: number): boolean => {
    return value.length >= min && value.length <= max;
  },
};

/**
 * 文字列ユーティリティ
 */
export const stringUtils = {
  // カタカナをひらがなに変換
  katakanaToHiragana: (str: string): string => {
    return str.replace(/[\u30a1-\u30f6]/g, (match) => {
      const char = match.charCodeAt(0) - 0x60;
      return String.fromCharCode(char);
    });
  },
  
  // ひらがなをカタカナに変換
  hiraganaToKatakana: (str: string): string => {
    return str.replace(/[\u3041-\u3096]/g, (match) => {
      const char = match.charCodeAt(0) + 0x60;
      return String.fromCharCode(char);
    });
  },
  
  // 文字列の切り捨て
  truncate: (str: string, length: number, suffix = '...'): string => {
    if (str.length <= length) return str;
    return str.substring(0, length) + suffix;
  },
  
  // ファイルサイズの人間可読形式
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
  
  // 数値をカンマ区切りに
  formatNumber: (num: number): string => {
    return num.toLocaleString('ja-JP');
  },
  
  // 金額フォーマット
  formatCurrency: (amount: number): string => {
    return `¥${amount.toLocaleString('ja-JP')}`;
  },
};

/**
 * 配列ユーティリティ
 */
export const arrayUtils = {
  // 配列をグループ化
  groupBy: <T, K extends keyof T>(array: T[], key: K): Record<string, T[]> => {
    return array.reduce((groups, item) => {
      const group = String(item[key]);
      if (!groups[group]) groups[group] = [];
      groups[group].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  },
  
  // 配列の重複を除去
  unique: <T>(array: T[]): T[] => {
    return Array.from(new Set(array));
  },
  
  // 配列をチャンク分割
  chunk: <T>(array: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  },
  
  // 配列をランダムシャッフル
  shuffle: <T>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },
};

/**
 * オブジェクトユーティリティ
 */
export const objectUtils = {
  // Deep clone
  deepClone: <T>(obj: T): T => {
    return JSON.parse(JSON.stringify(obj));
  },
  
  // オブジェクトのキーを変換
  transformKeys: <T extends Record<string, any>>(
    obj: T,
    transform: (key: string) => string
  ): Record<string, any> => {
    const transformed: Record<string, any> = {};
    Object.keys(obj).forEach(key => {
      transformed[transform(key)] = obj[key];
    });
    return transformed;
  },
  
  // オブジェクトから空の値を除去
  removeEmpty: <T extends Record<string, any>>(obj: T): Partial<T> => {
    const cleaned: Partial<T> = {};
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      if (value !== null && value !== undefined && value !== '') {
        cleaned[key as keyof T] = value;
      }
    });
    return cleaned;
  },
  
  // オブジェクトの差分を取得
  diff: <T extends Record<string, any>>(obj1: T, obj2: T): Partial<T> => {
    const differences: Partial<T> = {};
    Object.keys(obj2).forEach(key => {
      if (obj1[key] !== obj2[key]) {
        differences[key as keyof T] = obj2[key];
      }
    });
    return differences;
  },
};

/**
 * ローカルストレージユーティリティ
 */
export const storage = {
  // 安全なsetItem
  set: (key: string, value: any): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('LocalStorage set failed:', error);
    }
  },
  
  // 安全なgetItem
  get: <T = any>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.warn('LocalStorage get failed:', error);
      return null;
    }
  },
  
  // 安全なremoveItem
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('LocalStorage remove failed:', error);
    }
  },
  
  // キーの存在チェック
  exists: (key: string): boolean => {
    return localStorage.getItem(key) !== null;
  },
  
  // 全てクリア
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('LocalStorage clear failed:', error);
    }
  },
};

/**
 * ファイルユーティリティ
 */
export const fileUtils = {
  // ファイルをBase64に変換
  toBase64: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  },
  
  // 画像ファイルかチェック
  isImage: (file: File): boolean => {
    return file.type.startsWith('image/');
  },
  
  // ファイルサイズチェック
  checkSize: (file: File, maxSizeBytes: number): boolean => {
    return file.size <= maxSizeBytes;
  },
  
  // ファイル拡張子を取得
  getExtension: (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || '';
  },
  
  // ファイルダウンロード
  download: (blob: Blob, filename: string): void => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};

/**
 * GPS・位置情報ユーティリティ
 */
export const locationUtils = {
  // 2点間の距離を計算（メートル）
  calculateDistance: (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number => {
    const R = 6371e3; // 地球の半径（メートル）
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  },
  
  // 現在位置を取得
  getCurrentPosition: (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  },
  
  // 住所を緯度経度に変換（Geocoding API使用想定）
  geocodeAddress: async (address: string): Promise<{ lat: number; lng: number } | null> => {
    // 実際の実装では外部Geocoding APIを使用
    // ここではダミー実装
    return null;
  },
};

/**
 * デバウンス関数
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * スロットル関数
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};

/**
 * エラーハンドリングユーティリティ
 */
export const errorUtils = {
  // エラーメッセージを取得
  getErrorMessage: (error: any): string => {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.response?.data?.message) return error.response.data.message;
    return 'エラーが発生しました';
  },
  
  // APIエラーかチェック
  isApiError: (error: any): boolean => {
    return error?.response?.status !== undefined;
  },
  
  // ネットワークエラーかチェック
  isNetworkError: (error: any): boolean => {
    return error?.code === 'NETWORK_ERROR' || error?.message === 'Network Error';
  },
};

/**
 * 色ユーティリティ
 */
export const colorUtils = {
  // 16進数カラーをRGBに変換
  hexToRgb: (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  },
  
  // 色の明度を取得
  getLuminance: (hex: string): number => {
    const rgb = colorUtils.hexToRgb(hex);
    if (!rgb) return 0;
    
    const { r, g, b } = rgb;
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  },
  
  // 色が明るいかダークか判定
  isLight: (hex: string): boolean => {
    return colorUtils.getLuminance(hex) > 0.5;
  },
};