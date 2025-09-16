import axios from 'axios'
import { authService } from './authService'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

export interface InviteCode {
  id: string
  token: string
  expiresAt: string
  used: boolean
  createdAt: string
}

export interface InviteStatistics {
  total: number
  used: number
  active: number
}

export interface InviteCodesResponse {
  inviteCodes: InviteCode[]
  statistics: InviteStatistics
}

class InviteService {
  private getAuthHeaders() {
    const token = authService.getToken()
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  // 新しい招待コードを生成
  async generateInviteCode(): Promise<{ inviteCode: string; expiresAt: string; id: string }> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/invite/generate`,
        {},
        { headers: this.getAuthHeaders() }
      )
      
      if (response.data.success) {
        return response.data.data
      } else {
        throw new Error(response.data.error || '招待コードの生成に失敗しました')
      }
    } catch (error: any) {
      console.error('招待コード生成エラー:', error)
      throw new Error(
        error.response?.data?.error || 
        error.message || 
        '招待コードの生成に失敗しました'
      )
    }
  }

  // 招待コード一覧を取得
  async getInviteCodes(): Promise<InviteCodesResponse> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/auth/invite/codes`,
        { headers: this.getAuthHeaders() }
      )
      
      if (response.data.success) {
        return response.data.data
      } else {
        throw new Error(response.data.error || '招待コードの取得に失敗しました')
      }
    } catch (error: any) {
      console.error('招待コード取得エラー:', error)
      throw new Error(
        error.response?.data?.error || 
        error.message || 
        '招待コードの取得に失敗しました'
      )
    }
  }

  // 招待コードを無効化
  async revokeInviteCode(codeId: string): Promise<void> {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/auth/invite/codes/${codeId}`,
        { headers: this.getAuthHeaders() }
      )
      
      if (!response.data.success) {
        throw new Error(response.data.error || '招待コードの無効化に失敗しました')
      }
    } catch (error: any) {
      console.error('招待コード無効化エラー:', error)
      throw new Error(
        error.response?.data?.error || 
        error.message || 
        '招待コードの無効化に失敗しました'
      )
    }
  }

  // パブリック招待コード取得（認証不要）
  async getPublicInviteCodes(): Promise<{ token: string; expiresAt: string; createdAt: string }[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/invite/public-codes`)
      
      if (response.data.success) {
        return response.data.data.inviteCodes
      } else {
        throw new Error(response.data.error || '招待コードの取得に失敗しました')
      }
    } catch (error: any) {
      console.error('パブリック招待コード取得エラー:', error)
      throw new Error(
        error.response?.data?.error || 
        error.message || 
        '招待コードの取得に失敗しました'
      )
    }
  }
}

export const inviteService = new InviteService()