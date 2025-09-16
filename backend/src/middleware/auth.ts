import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import prisma from '../services/database.js'

// JWT トークンペイロードの型定義
interface JwtPayload {
  userId: string
  role: 'ADMIN' | 'EMPLOYEE'
  companyId: string
}

// Request オブジェクトを拡張
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string
        role: 'ADMIN' | 'EMPLOYEE'
        companyId: string
      }
    }
  }
}

// JWT トークン認証ミドルウェア
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: '認証トークンが必要です'
      })
    }

    const token = authHeader.substring(7) // "Bearer " を除去
    const jwtSecret = process.env.JWT_SECRET

    if (!jwtSecret) {
      console.error('JWT_SECRET が設定されていません')
      return res.status(500).json({
        success: false,
        error: 'サーバー設定エラー'
      })
    }

    // トークンの検証
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload
    
    // ユーザーの存在確認
    const user = await prisma.user.findFirst({
      where: {
        id: decoded.userId,
        isActive: true
      },
      select: {
        id: true,
        role: true,
        companyId: true
      }
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'ユーザーが見つかりません'
      })
    }

    // セッションの有効性確認
    const session = await prisma.session.findFirst({
      where: {
        userId: user.id,
        token,
        expiresAt: {
          gt: new Date()
        }
      }
    })

    if (!session) {
      return res.status(401).json({
        success: false,
        error: 'セッションが無効です'
      })
    }

    // リクエストオブジェクトにユーザー情報を追加
    req.user = {
      userId: user.id,
      role: user.role,
      companyId: user.companyId
    }

    next()
  } catch (error) {
    console.error('認証エラー:', error)
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        error: 'トークンが無効です'
      })
    }

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        error: 'トークンの有効期限が切れています'
      })
    }

    return res.status(500).json({
      success: false,
      error: 'サーバーエラーが発生しました'
    })
  }
}

// 管理者権限チェック
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: '認証が必要です'
    })
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: '管理者権限が必要です'
    })
  }

  next()
}

// オプション認証（認証されていなくてもエラーにしない）
export const optionalAuthenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next()
    }

    const token = authHeader.substring(7)
    const jwtSecret = process.env.JWT_SECRET

    if (!jwtSecret) {
      return next()
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload
    
    const user = await prisma.user.findFirst({
      where: {
        id: decoded.userId,
        isActive: true
      },
      select: {
        id: true,
        role: true,
        companyId: true
      }
    })

    if (user) {
      req.user = {
        userId: user.id,
        role: user.role,
        companyId: user.companyId
      }
    }

    next()
  } catch (error) {
    // エラーがあってもスルーして次の処理へ
    next()
  }
}