import { Router } from 'express'
// import { userController } from '../controllers/userController.js'
// import { authenticate } from '../middleware/auth.js'

const router = Router()

// 全てのルートに認証が必要
// router.use(authenticate)

// ユーザー関連ルート
// router.get('/', userController.getUsers)
// router.get('/:id', userController.getUserById)
// router.put('/:id', userController.updateUser)
// router.delete('/:id', userController.deleteUser)

// プロフィール
// router.get('/profile/me', userController.getMyProfile)
// router.put('/profile/me', userController.updateMyProfile)

// 設定
// router.get('/settings/me', userController.getMySettings)
// router.put('/settings/me', userController.updateMySettings)

// プレースホルダーレスポンス
router.get('/', (req, res) => {
  res.json({ message: 'Users endpoint - under development' })
})

export default router