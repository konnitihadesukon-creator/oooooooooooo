import { Router } from 'express'
import { chatController } from '../controllers/chatController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

// 認証必須
router.use(authenticate)

// チャット一覧取得
router.get('/', chatController.getChats)

// チャット作成
router.post('/', chatController.createChat)

// チャット詳細取得
router.get('/:id', chatController.getChatById)

// チャットメッセージ取得
router.get('/:chatId/messages', chatController.getChatMessages)

// メッセージ送信
router.post('/:chatId/messages', chatController.sendMessage)

// チャットから退出
router.delete('/:chatId/leave', chatController.leaveChat)

// メッセージ既読マーク
router.patch('/messages/:messageId/read', chatController.markAsRead)

export default router
