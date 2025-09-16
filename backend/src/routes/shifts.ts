import { Router } from 'express'

const router = Router()

// プレースホルダーレスポンス
router.get('/', (req, res) => {
  res.json({ message: 'Shifts endpoint - under development' })
})

export default router
