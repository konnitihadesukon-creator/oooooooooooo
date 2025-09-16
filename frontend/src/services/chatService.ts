import axios from 'axios'
import { io, Socket } from 'socket.io-client'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'

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

export interface User {
  id: string
  name: string
  avatar?: string
  isOnline?: boolean
}

export interface Message {
  id: string
  senderId: string
  sender: User
  content: string
  type: 'TEXT' | 'IMAGE' | 'FILE'
  attachments?: string[]
  createdAt: string
  readBy?: string[]
}

export interface Chat {
  id: string
  name?: string
  type: 'GROUP' | 'DIRECT'
  participants: User[]
  lastMessage?: Message
  unreadCount?: number
  updatedAt: string
}

class ChatServiceClass {
  private socket: Socket | null = null

  // Socket.IO 接続
  connect(userId: string) {
    const token = localStorage.getItem('shift_match_auth_token')
    
    this.socket = io(SOCKET_URL, {
      auth: {
        token: token ? JSON.parse(token) : null,
        userId
      }
    })

    this.socket.on('connect', () => {
      console.log('Socket.IO connected')
    })

    this.socket.on('disconnect', () => {
      console.log('Socket.IO disconnected')
    })

    return this.socket
  }

  // Socket.IO 切断
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  // チャット一覧取得
  async getChats() {
    const response = await api.get('/chat')
    return response.data
  }

  // チャット詳細取得
  async getChatById(id: string) {
    const response = await api.get(`/chat/${id}`)
    return response.data
  }

  // チャットメッセージ取得
  async getChatMessages(chatId: string, page = 1, limit = 50) {
    const response = await api.get(`/chat/${chatId}/messages`, {
      params: { page, limit }
    })
    return response.data
  }

  // メッセージ送信
  async sendMessage(chatId: string, messageData: {
    content: string
    type?: 'TEXT' | 'IMAGE' | 'FILE'
    attachments?: string[]
  }) {
    const response = await api.post(`/chat/${chatId}/messages`, messageData)
    return response.data
  }

  // チャット作成
  async createChat(chatData: {
    name?: string
    type: 'GROUP' | 'DIRECT'
    participantIds: string[]
  }) {
    const response = await api.post('/chat', chatData)
    return response.data
  }

  // チャットから退出
  async leaveChat(chatId: string) {
    const response = await api.delete(`/chat/${chatId}/leave`)
    return response.data
  }

  // メッセージ既読
  async markAsRead(messageId: string) {
    const response = await api.patch(`/chat/messages/${messageId}/read`)
    return response.data
  }

  // リアルタイムイベントリスナー
  onMessageReceived(callback: (data: { chatId: string; message: Message }) => void) {
    if (this.socket) {
      this.socket.on('message-received', callback)
    }
  }

  onUserOnline(callback: (userId: string) => void) {
    if (this.socket) {
      this.socket.on('user-online', callback)
    }
  }

  onUserOffline(callback: (userId: string) => void) {
    if (this.socket) {
      this.socket.on('user-offline', callback)
    }
  }

  // チャットルーム参加/離脱
  joinChat(chatId: string) {
    if (this.socket) {
      this.socket.emit('join-chat', { chatId })
    }
  }

  leaveRoom(chatId: string) {
    if (this.socket) {
      this.socket.emit('leave-chat', { chatId })
    }
  }

  // ファイルアップロード
  async uploadFile(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)

    try {
      // TODO: 実際のファイルアップロード処理
      // const response = await api.post('/chat/upload-file', formData, {
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
      console.error('ファイルアップロードエラー:', error)
      throw new Error('ファイルのアップロードに失敗しました')
    }
  }
}

export const chatService = new ChatServiceClass()
export default chatService