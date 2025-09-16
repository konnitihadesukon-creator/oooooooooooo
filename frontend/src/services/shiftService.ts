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

export interface ShiftRequest {
  id?: string
  month: string
  dates: Record<string, 'AVAILABLE' | 'UNAVAILABLE' | 'UNDECIDED'>
  comment?: string
  submittedAt?: string
}

export interface Shift {
  id: string
  companyId: string
  month: string
  status: 'DRAFT' | 'PUBLISHED'
  publishedAt?: string
  slots: ShiftSlot[]
}

export interface ShiftSlot {
  id: string
  locationId: string
  date: string
  requiredCount: number
  isPublic: boolean
  priority?: string
  location: {
    id: string
    name: string
    address: string
  }
  assignments: ShiftAssignment[]
}

export interface ShiftAssignment {
  id: string
  userId: string
  isConfirmed: boolean
  user: {
    id: string
    name: string
    avatar?: string
  }
}

export const shiftService = {
  // シフト一覧取得
  getShifts: async (year?: number, month?: number) => {
    const params: Record<string, any> = {}
    if (year && month) {
      params.year = year
      params.month = month
    }

    const response = await api.get('/shifts', { params })
    return response.data
  },

  // シフト詳細取得
  getShiftById: async (id: string) => {
    const response = await api.get(`/shifts/${id}`)
    return response.data
  },

  // シフト作成（管理者）
  createShift: async (shiftData: { month: string; slots: any[] }) => {
    const response = await api.post('/shifts', shiftData)
    return response.data
  },

  // シフト公開（管理者）
  publishShift: async (id: string) => {
    const response = await api.patch(`/shifts/${id}/publish`)
    return response.data
  },

  // シフト希望一覧取得
  getShiftRequests: async (year?: number, month?: number) => {
    const params: Record<string, any> = {}
    if (year && month) {
      params.year = year
      params.month = month
    }

    const response = await api.get('/shifts/requests', { params })
    return response.data
  },

  // シフト希望提出
  submitShiftRequest: async (requestData: ShiftRequest) => {
    const response = await api.post('/shifts/requests', requestData)
    return response.data
  },

  // シフト割り当て（管理者）
  assignShift: async (assignmentData: {
    slotId: string
    userId: string
    isConfirmed?: boolean
  }) => {
    const response = await api.post('/shifts/assign', assignmentData)
    return response.data
  }
}

export default shiftService