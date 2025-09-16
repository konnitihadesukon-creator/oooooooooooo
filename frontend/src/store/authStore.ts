import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, LoginRequest, LoginResponse, STORAGE_KEYS } from '../types'
import { authService } from '../services/authService'
import { storage } from '../utils/storage'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => void
  refreshAccessToken: () => Promise<void>
  initializeAuth: () => void
  clearError: () => void
  updateUser: (userData: Partial<User>) => void
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: LoginRequest) => {
        try {
          set({ isLoading: true, error: null })
          
          const response = await authService.login(credentials)
          
          // Convert backend user to frontend User type
          const user: User = {
            id: response.user.id,
            email: response.user.email,
            name: response.user.name,
            role: response.user.role as 'ADMIN' | 'EMPLOYEE',
            avatar: response.user.avatar,
            companyId: response.user.companyId,
            isActive: true, // Default values for missing fields
            biometricEnabled: false,
            notificationSettings: {
              email: true,
              push: true,
              sms: false,
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
          
          set({
            user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isLoading: false,
            error: null,
          })
          
          // トークンをローカルストレージにも保存
          storage.set(STORAGE_KEYS.AUTH_TOKEN, response.accessToken)
          storage.set(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken)
          
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'ログインに失敗しました',
          })
          throw error
        }
      },

      logout: () => {
        // ローカルストレージをクリア
        storage.remove(STORAGE_KEYS.AUTH_TOKEN)
        storage.remove(STORAGE_KEYS.REFRESH_TOKEN)
        storage.remove(STORAGE_KEYS.USER_DATA)
        
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          error: null,
        })
        
        // サーバーにもログアウト通知
        authService.logout().catch(console.error)
      },

      refreshAccessToken: async () => {
        try {
          const { refreshToken } = get()
          if (!refreshToken) {
            throw new Error('リフレッシュトークンがありません')
          }

          const response = await authService.refreshToken(refreshToken)
          
          set({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
          })
          
          // 新しいトークンを保存
          storage.set(STORAGE_KEYS.AUTH_TOKEN, response.accessToken)
          storage.set(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken)
          
        } catch (error) {
          // リフレッシュ失敗時はログアウト
          get().logout()
          throw error
        }
      },

      initializeAuth: () => {
        set({ isLoading: true })
        
        try {
          // ローカルストレージからトークンを復元
          const accessToken = storage.get<string>(STORAGE_KEYS.AUTH_TOKEN)
          const refreshToken = storage.get<string>(STORAGE_KEYS.REFRESH_TOKEN)
          const userData = storage.get<User>(STORAGE_KEYS.USER_DATA)
          
          if (accessToken && refreshToken && userData) {
            set({
              user: userData,
              accessToken,
              refreshToken,
              isLoading: false,
            })
            
            // トークンの有効性を確認
            authService.validateToken(accessToken)
              .catch(() => {
                // トークンが無効な場合はリフレッシュを試行
                get().refreshAccessToken().catch(() => {
                  get().logout()
                })
              })
          } else {
            set({ isLoading: false })
          }
        } catch (error) {
          console.error('認証初期化エラー:', error)
          set({ isLoading: false })
          get().logout()
        }
      },

      clearError: () => {
        set({ error: null })
      },

      updateUser: (userData: Partial<User>) => {
        const { user } = get()
        if (user) {
          const updatedUser = { ...user, ...userData }
          set({ user: updatedUser })
          storage.set(STORAGE_KEYS.USER_DATA, updatedUser)
        }
      },
    }),
    {
      name: 'shift-match-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
)