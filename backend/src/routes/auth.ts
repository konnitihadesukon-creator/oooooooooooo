import { Router } from 'express'
import { authController } from '../controllers/authController.js'
import { authLimiter, passwordResetLimiter } from '../middleware/rateLimiter.js'

const router = Router()

// 認証関連ルート
router.post('/login', authLimiter, authController.login)
router.post('/register', authController.register)
router.post('/logout', authController.logout)
router.post('/refresh', authController.refreshToken)
router.get('/validate', authController.validateToken)

// OTP関連
router.post('/otp/send', authLimiter, authController.sendOtp)
router.post('/otp/verify', authLimiter, authController.verifyOtp)

// パスワードリセット
router.post('/password/reset-request', passwordResetLimiter, authController.requestPasswordReset)
router.post('/password/reset', authController.resetPassword)

// 生体認証
router.post('/biometric/enable', authController.enableBiometricAuth)
router.post('/biometric/login', authLimiter, authController.biometricLogin)

export default router