import { Router } from 'express'
import { reportController } from '../controllers/reportController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

// 全てのルートに認証が必要
router.use(authenticate)

// 日報関連ルート
router.get('/', reportController.getReports)
router.post('/', reportController.saveReport)
router.get('/today', reportController.getTodayReport)
router.get('/stats', reportController.getReportStats)
router.get('/:id', reportController.getReportById)
router.put('/:id', reportController.saveReport)
router.delete('/:id', reportController.deleteReport)

export default router