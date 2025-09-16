import rateLimit from 'express-rate-limit'
import { Request, Response } from 'express'

// 基本的なレート制限
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 100, // 15分間で最大100リクエスト
  message: {
    success: false,
    error: 'リクエストが多すぎます。しばらく待ってから再試行してください。',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: 'リクエストが多すぎます。しばらく待ってから再試行してください。',
      retryAfter: Math.round(req.rateLimit.resetTime / 1000),
    })
  },
})

// 認証エンドポイント用のより厳しいレート制限
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 5, // 15分間で最大5回の認証試行
  message: {
    success: false,
    error: '認証の試行回数が制限を超えました。15分後に再試行してください。',
  },
  skipSuccessfulRequests: true, // 成功したリクエストはカウントしない
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: '認証の試行回数が制限を超えました。15分後に再試行してください。',
      retryAfter: Math.round(req.rateLimit.resetTime / 1000),
    })
  },
})

// パスワードリセット用のレート制限
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1時間
  max: 3, // 1時間で最大3回
  message: {
    success: false,
    error: 'パスワードリセットの試行回数が制限を超えました。1時間後に再試行してください。',
  },
  keyGenerator: (req: Request) => {
    // IPアドレスとメールアドレスの組み合わせでキーを生成
    return `${req.ip}-${req.body.email}`
  },
})

// ファイルアップロード用のレート制限
export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1分
  max: 10, // 1分間で最大10回のアップロード
  message: {
    success: false,
    error: 'ファイルアップロードの回数が制限を超えました。しばらく待ってから再試行してください。',
  },
})

// API呼び出し用のレート制限
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1分
  max: 60, // 1分間で最大60リクエスト
  message: {
    success: false,
    error: 'API呼び出しの制限を超えました。しばらく待ってから再試行してください。',
  },
})