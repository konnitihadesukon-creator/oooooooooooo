import { Request, Response } from 'express'
import prisma from '../services/database.js'

// チャット一覧取得
export const getChats = async (req: Request, res: Response) => {
  try {
    const { companyId, userId } = req.user!

    const chats = await prisma.chat.findMany({
      where: {
        companyId,
        participants: {
          some: {
            userId: userId
          }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        },
        _count: {
          select: {
            messages: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    res.json({
      success: true,
      data: { chats }
    })
  } catch (error) {
    console.error('チャット一覧取得エラー:', error)
    res.status(500).json({
      success: false,
      error: 'サーバーエラーが発生しました'
    })
  }
}

// チャット詳細取得
export const getChatById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { companyId, userId } = req.user!

    const chat = await prisma.chat.findFirst({
      where: {
        id,
        companyId,
        participants: {
          some: {
            userId: userId
          }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        }
      }
    })

    if (!chat) {
      return res.status(404).json({
        success: false,
        error: 'チャットが見つかりません'
      })
    }

    res.json({
      success: true,
      data: { chat }
    })
  } catch (error) {
    console.error('チャット詳細取得エラー:', error)
    res.status(500).json({
      success: false,
      error: 'サーバーエラーが発生しました'
    })
  }
}

// チャットメッセージ取得
export const getChatMessages = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params
    const { companyId, userId } = req.user!
    const { page = 1, limit = 50 } = req.query

    // チャットへのアクセス権限チェック
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        companyId,
        participants: {
          some: {
            userId: userId
          }
        }
      }
    })

    if (!chat) {
      return res.status(404).json({
        success: false,
        error: 'チャットが見つかりません'
      })
    }

    const messages = await prisma.message.findMany({
      where: { chatId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    })

    // メッセージを既読にする
    await prisma.message.updateMany({
      where: {
        chatId,
        senderId: { not: userId },
        readBy: {
          none: {
            userId: userId
          }
        }
      },
      data: {
        readBy: {
          create: {
            userId: userId
          }
        }
      }
    })

    res.json({
      success: true,
      data: { 
        messages: messages.reverse(), // 古い順にソート
        hasMore: messages.length === Number(limit)
      }
    })
  } catch (error) {
    console.error('チャットメッセージ取得エラー:', error)
    res.status(500).json({
      success: false,
      error: 'サーバーエラーが発生しました'
    })
  }
}

// メッセージ送信
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params
    const { companyId, userId } = req.user!
    const { content, type = 'TEXT', attachments = [] } = req.body

    if (!content && (!attachments || attachments.length === 0)) {
      return res.status(400).json({
        success: false,
        error: 'メッセージ内容またはファイルが必要です'
      })
    }

    // チャットへのアクセス権限チェック
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        companyId,
        participants: {
          some: {
            userId: userId
          }
        }
      },
      include: {
        participants: {
          select: {
            userId: true
          }
        }
      }
    })

    if (!chat) {
      return res.status(404).json({
        success: false,
        error: 'チャットが見つかりません'
      })
    }

    // メッセージ作成
    const message = await prisma.message.create({
      data: {
        chatId,
        senderId: userId,
        content: content || '',
        type,
        attachments: JSON.stringify(attachments),
        readBy: {
          create: {
            userId: userId // 送信者は自動的に既読
          }
        }
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    })

    // チャットの最終更新時刻を更新
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() }
    })

    // Socket.IO でリアルタイム送信
    const io = (global as any).io
    if (io) {
      chat.participants.forEach(participant => {
        if (participant.userId !== userId) {
          io.to(participant.userId).emit('message-received', {
            chatId,
            message
          })
        }
      })
    }

    // 他の参加者に通知を作成
    const otherParticipants = chat.participants.filter(p => p.userId !== userId)
    if (otherParticipants.length > 0) {
      const notifications = otherParticipants.map(participant => ({
        userId: participant.userId,
        companyId,
        type: 'CHAT_MESSAGE',
        title: 'チャット',
        content: `${message.sender.name}さんからメッセージが届きました`,
        data: JSON.stringify({ 
          chatId,
          messageId: message.id,
          senderName: message.sender.name
        })
      }))

      await prisma.notification.createMany({
        data: notifications
      })
    }

    res.status(201).json({
      success: true,
      data: { message }
    })
  } catch (error) {
    console.error('メッセージ送信エラー:', error)
    res.status(500).json({
      success: false,
      error: 'サーバーエラーが発生しました'
    })
  }
}

// チャット作成
export const createChat = async (req: Request, res: Response) => {
  try {
    const { companyId, userId, role } = req.user!
    const { name, type = 'GROUP', participantIds = [] } = req.body

    if (!participantIds.includes(userId)) {
      participantIds.push(userId)
    }

    // ダイレクトチャットの場合は既存チェック
    if (type === 'DIRECT' && participantIds.length === 2) {
      const existingChat = await prisma.chat.findFirst({
        where: {
          companyId,
          type: 'DIRECT',
          participants: {
            every: {
              userId: { in: participantIds }
            }
          }
        },
        include: {
          participants: true
        }
      })

      if (existingChat && existingChat.participants.length === 2) {
        return res.json({
          success: true,
          data: { chat: existingChat }
        })
      }
    }

    // 参加者の存在確認
    const users = await prisma.user.findMany({
      where: {
        id: { in: participantIds },
        companyId,
        isActive: true
      }
    })

    if (users.length !== participantIds.length) {
      return res.status(400).json({
        success: false,
        error: '無効なユーザーが含まれています'
      })
    }

    // チャット作成
    const chat = await prisma.chat.create({
      data: {
        companyId,
        name,
        type,
        participants: {
          create: participantIds.map((participantId: string) => ({
            userId: participantId
          }))
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        }
      }
    })

    res.status(201).json({
      success: true,
      data: { chat }
    })
  } catch (error) {
    console.error('チャット作成エラー:', error)
    res.status(500).json({
      success: false,
      error: 'サーバーエラーが発生しました'
    })
  }
}

// チャットから退出
export const leaveChat = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params
    const { companyId, userId } = req.user!

    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        companyId,
        participants: {
          some: {
            userId: userId
          }
        }
      }
    })

    if (!chat) {
      return res.status(404).json({
        success: false,
        error: 'チャットが見つかりません'
      })
    }

    await prisma.chatParticipant.deleteMany({
      where: {
        chatId,
        userId
      }
    })

    res.json({
      success: true,
      message: 'チャットから退出しました'
    })
  } catch (error) {
    console.error('チャット退出エラー:', error)
    res.status(500).json({
      success: false,
      error: 'サーバーエラーが発生しました'
    })
  }
}

// 既読マーク
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params
    const { userId } = req.user!

    const message = await prisma.message.findUnique({
      where: { id: messageId }
    })

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'メッセージが見つかりません'
      })
    }

    // 既読記録がない場合のみ追加
    const existingRead = await prisma.messageRead.findFirst({
      where: {
        messageId,
        userId
      }
    })

    if (!existingRead) {
      await prisma.messageRead.create({
        data: {
          messageId,
          userId
        }
      })
    }

    res.json({
      success: true,
      message: '既読にしました'
    })
  } catch (error) {
    console.error('既読マークエラー:', error)
    res.status(500).json({
      success: false,
      error: 'サーバーエラーが発生しました'
    })
  }
}

export const chatController = {
  getChats,
  getChatById,
  getChatMessages,
  sendMessage,
  createChat,
  leaveChat,
  markAsRead
}