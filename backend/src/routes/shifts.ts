import { Router } from 'express'
import { shiftController } from '../controllers/shiftController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

// 全てのルートに認証が必要
router.use(authenticate)

// シフト関連ルート
router.get('/', shiftController.getShifts)
router.post('/', shiftController.createShift)
router.get('/:id', shiftController.getShiftById)
router.put('/:id/publish', shiftController.publishShift)

// シフト希望
router.get('/requests', shiftController.getShiftRequests)
router.post('/requests', shiftController.submitShiftRequest)

// シフト割り当て
router.post('/assignments', shiftController.assignShift)

export default router