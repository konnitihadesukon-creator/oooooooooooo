import axios, { type AxiosResponse } from 'axios'

// Temporary local types until shared module resolution is fixed
interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar?: string;
    companyId: string;
  };
  accessToken: string;
  refreshToken: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  companyName?: string;
  role?: 'ADMIN' | 'EMPLOYEE';
  invitationToken?: string;
}

interface OtpRequest {
  email: string;
  type: 'LOGIN' | 'REGISTER' | 'PASSWORD_RESET';
}

interface OtpVerifyRequest {
  email: string;
  otp: string;
  type: 'LOGIN' | 'REGISTER' | 'PASSWORD_RESET';
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  errors?: string[];
}

// API Configuration (temporary)
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  TIMEOUT: 30000
}

// Debug logging
console.log('🔧 API Base URL:', API_CONFIG.BASE_URL)

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
})

// レスポンス型の定義
interface RefreshTokenResponse {
  accessToken: string
  refreshToken: string
}

export const authService = {
  // ログイン
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response: AxiosResponse<ApiResponse<LoginResponse>> = await api.post(
      '/auth/login', 
      credentials
    )
    return response.data.data!
  },

  // 新規登録
  register: async (userData: RegisterRequest): Promise<LoginResponse> => {
    console.log('📝 Register request:', userData)
    const response: AxiosResponse<ApiResponse<LoginResponse>> = await api.post(
      '/auth/register', 
      userData
    )
    console.log('✅ Register response:', response.data)
    return response.data.data!
  },

  // ログアウト
  logout: async (): Promise<void> => {
    await api.post('/auth/logout')
  },

  // トークンリフレッシュ
  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response: AxiosResponse<ApiResponse<RefreshTokenResponse>> = await api.post(
      '/auth/refresh', 
      { refreshToken }
    )
    return response.data.data!
  },

  // トークン検証
  validateToken: async (token: string): Promise<boolean> => {
    try {
      await api.get('/auth/validate', {
        headers: { Authorization: `Bearer ${token}` }
      })
      return true
    } catch {
      return false
    }
  },

  // OTP送信
  sendOtp: async (request: OtpRequest): Promise<void> => {
    await api.post('/auth/otp/send', request)
  },

  // OTP検証
  verifyOtp: async (request: OtpVerifyRequest): Promise<LoginResponse> => {
    const response: AxiosResponse<ApiResponse<LoginResponse>> = await api.post(
      '/auth/otp/verify', 
      request
    )
    return response.data.data!
  },

  // パスワードリセット要求
  requestPasswordReset: async (email: string): Promise<void> => {
    await api.post('/auth/password/reset-request', { email })
  },

  // パスワードリセット実行
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await api.post('/auth/password/reset', { token, newPassword })
  },

  // 生体認証設定
  enableBiometricAuth: async (publicKey: string): Promise<void> => {
    await api.post('/auth/biometric/enable', { publicKey })
  },

  // 生体認証ログイン
  biometricLogin: async (signature: string, userId: string): Promise<LoginResponse> => {
    const response: AxiosResponse<ApiResponse<LoginResponse>> = await api.post(
      '/auth/biometric/login',
      { signature, userId }
    )
    return response.data.data!
  },
}

// エラーメッセージマッピング
const errorMessages: Record<number, string> = {
  400: 'リクエストが無効です。入力内容を確認してください。',
  401: 'ログインが必要です。再度ログインしてください。',
  403: 'この操作を実行する権限がありません。',
  404: 'リクエストされたリソースが見つかりません。',
  409: '既に存在するデータです。',
  422: '入力データに不備があります。',
  429: 'リクエストが多すぎます。しばらく待ってから再試行してください。',
  500: 'サーバーでエラーが発生しました。時間を置いて再試行してください。',
  502: 'サーバーに接続できません。',
  503: 'サービスが一時的に利用できません。',
}

// レスポンスインターセプター（エラーハンドリングとトークンリフレッシュ）
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    // ネットワークエラーの場合
    if (!error.response) {
      error.message = 'ネットワークエラーです。インターネット接続を確認してください。'
      return Promise.reject(error)
    }

    // 401エラーでトークンリフレッシュ
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        const refreshToken = localStorage.getItem('shift_match_refresh_token')
        if (refreshToken) {
          const { accessToken } = await authService.refreshToken(JSON.parse(refreshToken))
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    
    // エラーメッセージの改善
    const status = error.response.status
    const serverMessage = error.response.data?.error || error.response.data?.message
    
    error.message = serverMessage || errorMessages[status] || `予期しないエラーが発生しました (${status})`
    
    return Promise.reject(error)
  }
)

export default authService