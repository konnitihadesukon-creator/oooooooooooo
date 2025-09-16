import { Router } from 'express'

const router = Router()

// プレースホルダーレスポンス
router.get('/', (req, res) => {
  res.json({ message: 'Chat endpoint - under development' })
})

export default router
