import { Router } from 'express'
import { authController } from '../controllers/authController.js'
import { authLimiter, passwordResetLimiter } from '../middleware/rateLimiter.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

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

// 招待コード管理（管理者用）
router.post('/invite/generate', authenticate, requireAdmin, authController.generateInviteCode)
router.get('/invite/codes', authenticate, requireAdmin, authController.getInviteCodes)
router.delete('/invite/codes/:codeId', authenticate, requireAdmin, authController.revokeInviteCode)

// パブリック招待コード取得（認証不要）
router.get('/invite/public-codes', authController.getPublicInviteCodes)

export default router