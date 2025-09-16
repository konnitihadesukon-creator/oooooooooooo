import { Router } from 'express'
import { attendanceController } from '../controllers/attendanceController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

// 全てのルートに認証が必要
router.use(authenticate)

// 勤怠関連ルート
router.get('/', attendanceController.getAttendance)
router.post('/clock-in', attendanceController.clockIn)
router.post('/clock-out', attendanceController.clockOut)
router.get('/stats', attendanceController.getAttendanceStats)
router.get('/today', attendanceController.getTodayStatus)

export default router