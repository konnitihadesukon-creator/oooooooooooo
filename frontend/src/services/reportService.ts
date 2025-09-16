import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

// リクエストインターセプター（認証トークンを自動付与）
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('shift_match_auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${JSON.parse(token)}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

export interface PieceRateItem {
  id?: string
  name: string
  unitPrice: number
  quantity: number
  total: number
}

export interface DailyReport {
  id?: string
  date: string
  locationId: string
  paymentType: 'DAILY_RATE' | 'PIECE_RATE'
  dailyAmount?: number
  pieceRateItems?: PieceRateItem[]
  totalAmount: number
  photos: string[]
  notes?: string
  submittedAt?: string
  user?: {
    id: string
    name: string
    avatar?: string
  }
  location?: {
    id: string
    name: string
    address: string
  }
}

export interface ReportStats {
  userId: string
  userName: string
  totalReports: number
  totalEarnings: number
  dailyRateCount: number
  pieceRateCount: number
}

export const reportService = {
  // 日報一覧取得
  getReports: async (params?: {
    year?: number
    month?: number
    startDate?: string
    endDate?: string
  }) => {
    const response = await api.get('/reports', { params })
    return response.data
  },

  // 日報詳細取得
  getReportById: async (id: string) => {
    const response = await api.get(`/reports/${id}`)
    return response.data
  },

  // 日報作成・更新
  saveReport: async (reportData: DailyReport) => {
    const response = await api.post('/reports', reportData)
    return response.data
  },

  // 日報削除
  deleteReport: async (id: string) => {
    const response = await api.delete(`/reports/${id}`)
    return response.data
  },

  // 日報統計取得
  getReportStats: async (year?: number, month?: number) => {
    const params: Record<string, any> = {}
    if (year && month) {
      params.year = year
      params.month = month
    }

    const response = await api.get('/reports/stats', { params })
    return response.data
  },

  // 本日の日報取得
  getTodayReport: async () => {
    const response = await api.get('/reports/today')
    return response.data
  },

  // 写真アップロード
  uploadPhoto: async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('photo', file)

    try {
      // TODO: 実際の画像アップロード処理
      // const response = await api.post('/reports/upload-photo', formData, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data'
      //   }
      // })
      // return response.data.url

      // 仮のURL（開発用）
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(URL.createObjectURL(file))
        }, 1000)
      })
    } catch (error) {
      console.error('写真アップロードエラー:', error)
      throw new Error('写真のアップロードに失敗しました')
    }
  },

  // OCR処理
  processOCR: async (imageUrl: string): Promise<{
    text: string
    confidence: number
  }> => {
    try {
      // TODO: OCR API処理
      // const response = await api.post('/reports/ocr', { imageUrl })
      // return response.data

      // 仮のOCR結果（開発用）
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            text: '配送完了: 荷物数 25個\n時間: 14:30\n売上: ¥12,500',
            confidence: 0.95
          })
        }, 2000)
      })
    } catch (error) {
      console.error('OCR処理エラー:', error)
      throw new Error('OCR処理に失敗しました')
    }
  }
}

export default reportService