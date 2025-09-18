import axios, { AxiosResponse, AxiosError } from 'axios'

// APIベースURL設定
const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  
  // 開発環境でのフォールバック
  const protocol = window.location.protocol
  const hostname = window.location.hostname
  
  // ローカル開発環境
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//${hostname}:3001`
  }
  
  // サンドボックス環境（E2B）
  if (hostname.includes('e2b.dev')) {
    // 3000ポートを3001ポートに置換
    return hostname.replace('3000-', '3001-')
  }
  
  // その他の環境
  return `${protocol}//${hostname}:3001`
}

// Axiosインスタンス作成
export const api = axios.create({
  baseURL: `${getBaseURL()}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// リクエストインターセプター（認証トークン付与）
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// レスポンスインターセプター（エラーハンドリング）
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error: AxiosError) => {
    // 認証エラーの場合、ログアウト処理
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    
    // ネットワークエラーの場合
    if (!error.response) {
      console.error('ネットワークエラー:', error.message)
    }
    
    return Promise.reject(error)
  }
)

// API関数のヘルパー
export const apiRequest = {
  get: <T = any>(url: string) => api.get<T>(url),
  post: <T = any>(url: string, data?: any) => api.post<T>(url, data),
  put: <T = any>(url: string, data?: any) => api.put<T>(url, data),
  delete: <T = any>(url: string) => api.delete<T>(url),
  patch: <T = any>(url: string, data?: any) => api.patch<T>(url, data),
}

// レスポンス型定義
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// API設定情報をログ出力（デバッグ用）
console.log('🔗 API Configuration:', {
  baseURL: api.defaults.baseURL,
  timeout: api.defaults.timeout,
  hostname: window.location.hostname,
})

export default api