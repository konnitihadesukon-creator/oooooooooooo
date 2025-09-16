import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import { User } from '@prisma/client'
import prisma from './database.js'

interface SocketUser {
  id: string
  name: string
  role: string
  companyId: string
}

const connectedUsers = new Map<string, SocketUser>()

export function initializeSocket(io: Server) {
  // 認証ミドルウェア
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '')
      
      if (!token) {
        return next(new Error('認証トークンが必要です'))
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, name: true, role: true, companyId: true }
      })

      if (!user || !user.isActive) {
        return next(new Error('無効なユーザーです'))
      }

      socket.data.user = user
      next()
    } catch (error) {
      next(new Error('認証に失敗しました'))
    }
  })

  io.on('connection', (socket) => {
    const user = socket.data.user as SocketUser
    console.log(`User ${user.name} connected`)

    // ユーザーを会社のルームに参加
    socket.join(`company:${user.companyId}`)
    
    // 接続ユーザーを記録
    connectedUsers.set(socket.id, user)

    // オンライン状態をブロードキャスト
    socket.to(`company:${user.companyId}`).emit('user-online', {
      userId: user.id,
      name: user.name
    })

    // チャット関連のイベント
    socket.on('join-chat', (data: { chatId: string }) => {
      socket.join(`chat:${data.chatId}`)
    })

    socket.on('leave-chat', (data: { chatId: string }) => {
      socket.leave(`chat:${data.chatId}`)
    })

    socket.on('send-message', async (data: { chatId: string; content: string; type: string }) => {
      try {
        // チャットの参加者確認
        const chatParticipant = await prisma.chatParticipant.findFirst({
          where: {
            chatId: data.chatId,
            userId: user.id
          }
        })

        if (!chatParticipant) {
          socket.emit('error', { message: 'チャットに参加していません' })
          return
        }

        // メッセージを保存
        const message = await prisma.message.create({
          data: {
            chatId: data.chatId,
            senderId: user.id,
            content: data.content,
            type: data.type as any,
            readBy: [user.id]
          },
          include: {
            sender: {
              select: { id: true, name: true, avatar: true }
            }
          }
        })

        // チャット参加者にメッセージをブロードキャスト
        io.to(`chat:${data.chatId}`).emit('message-received', message)

        // 未読通知を送信（送信者以外）
        const otherParticipants = await prisma.chatParticipant.findMany({
          where: {
            chatId: data.chatId,
            userId: { not: user.id }
          },
          include: {
            user: true
          }
        })

        for (const participant of otherParticipants) {
          // プッシュ通知作成
          await prisma.notification.create({
            data: {
              userId: participant.userId,
              companyId: user.companyId,
              type: 'CHAT_MESSAGE',
              title: '新しいメッセージ',
              content: `${user.name}: ${data.content.substring(0, 50)}${data.content.length > 50 ? '...' : ''}`,
              data: { chatId: data.chatId, messageId: message.id }
            }
          })

          // リアルタイム通知
          socket.to(`user:${participant.userId}`).emit('notification', {
            type: 'CHAT_MESSAGE',
            title: '新しいメッセージ',
            content: `${user.name}からメッセージが届きました`,
            data: { chatId: data.chatId }
          })
        }

      } catch (error) {
        console.error('Message send error:', error)
        socket.emit('error', { message: 'メッセージの送信に失敗しました' })
      }
    })

    // 通知関連
    socket.on('mark-notification-read', async (data: { notificationId: string }) => {
      try {
        await prisma.notification.update({
          where: {
            id: data.notificationId,
            userId: user.id
          },
          data: { isRead: true }
        })
      } catch (error) {
        console.error('Notification read error:', error)
      }
    })

    // 位置情報更新（GPS勤怠用）
    socket.on('location-update', (data: { latitude: number; longitude: number }) => {
      // 管理者に位置情報をブロードキャスト
      socket.to(`company:${user.companyId}`).emit('user-location-update', {
        userId: user.id,
        name: user.name,
        latitude: data.latitude,
        longitude: data.longitude,
        timestamp: new Date().toISOString()
      })
    })

    // 切断処理
    socket.on('disconnect', () => {
      connectedUsers.delete(socket.id)
      
      // オフライン状態をブロードキャスト
      socket.to(`company:${user.companyId}`).emit('user-offline', {
        userId: user.id,
        name: user.name
      })
      
      console.log(`User ${user.name} disconnected`)
    })
  })
}

// ユーザーにメッセージを送信
export async function sendNotificationToUser(userId: string, notification: any) {
  const io = (global as any).io
  if (io) {
    io.to(`user:${userId}`).emit('notification', notification)
  }
}

// 会社全体にメッセージを送信
export async function sendNotificationToCompany(companyId: string, notification: any) {
  const io = (global as any).io
  if (io) {
    io.to(`company:${companyId}`).emit('notification', notification)
  }
}

// 接続中のユーザー一覧を取得
export function getConnectedUsers(): SocketUser[] {
  return Array.from(connectedUsers.values())
}