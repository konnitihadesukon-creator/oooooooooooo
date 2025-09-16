import axios, { AxiosResponse } from 'axios'
import { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  ApiResponse,
  OtpRequest,
  OtpVerifyRequest 
} from '@shared/types'
import { API_CONFIG } from '@shared/constants'

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
    const response: AxiosResponse<ApiResponse<LoginResponse>> = await api.post(
      '/auth/register', 
      userData
    )
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

// レスポンスインターセプター（トークンリフレッシュ用）
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        // Zustandストアからリフレッシュトークンを取得
        const refreshToken = localStorage.getItem('shift_match_refresh_token')
        if (refreshToken) {
          const { accessToken } = await authService.refreshToken(JSON.parse(refreshToken))
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // リフレッシュに失敗した場合はログアウト
        localStorage.clear()
        window.location.href = '/login'
      }
    }
    
    return Promise.reject(error)
  }
)

export default authService