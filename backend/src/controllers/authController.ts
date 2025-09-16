import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import speakeasy from 'speakeasy'
import prisma from '../services/database.js'
import { BadRequestError, UnauthorizedError, NotFoundError } from '../middleware/errorHandler.js'

interface AuthRequest extends Request {
  user?: any
}

export const authController = {
  // ログイン
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body

      if (!email || !password) {
        throw new BadRequestError('メールアドレスとパスワードが必要です')
      }

      // ユーザー検索
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          company: {
            select: { id: true, name: true }
          }
        }
      })

      if (!user || !user.isActive) {
        throw new UnauthorizedError('メールアドレスまたはパスワードが正しくありません')
      }

      // パスワード確認
      const isValidPassword = await bcrypt.compare(password, user.password)
      if (!isValidPassword) {
        throw new UnauthorizedError('メールアドレスまたはパスワードが正しくありません')
      }

      // トークン生成
      const accessToken = jwt.sign(
        { userId: user.id, role: user.role, companyId: user.companyId },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      )

      const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
      )

      // セッション保存
      await prisma.session.create({
        data: {
          userId: user.id,
          token: refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7日後
        }
      })

      // レスポンス（パスワードを除外）
      const { password: _, ...userWithoutPassword } = user

      res.json({
        success: true,
        data: {
          user: userWithoutPassword,
          accessToken,
          refreshToken
        }
      })
    } catch (error) {
      next(error)
    }
  },

  // 新規登録
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, name, invitationToken } = req.body

      if (!email || !password || !name) {
        throw new BadRequestError('必要な情報が不足しています')
      }

      // 既存ユーザーチェック
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        throw new BadRequestError('このメールアドレスは既に登録されています')
      }

      let companyId: string

      // 招待トークンがある場合の処理
      if (invitationToken) {
        const invitation = await prisma.tempToken.findFirst({
          where: {
            token: invitationToken,
            type: 'INVITATION',
            used: false,
            expiresAt: { gt: new Date() }
          }
        })

        if (!invitation) {
          throw new BadRequestError('無効または期限切れの招待コードです')
        }

        // 招待に指定された会社IDを取得（実際の実装では招待データに含める）
        const company = await prisma.company.findFirst()
        if (!company) {
          throw new BadRequestError('会社が見つかりません')
        }
        companyId = company.id

        // 招待トークンを使用済みにする
        await prisma.tempToken.update({
          where: { id: invitation.id },
          data: { used: true }
        })
      } else {
        // 新規会社作成（管理者の場合）
        const company = await prisma.company.create({
          data: {
            name: `${name}の会社`, // デフォルト名
            adminId: 'temp' // 一時的なID
          }
        })
        companyId = company.id
      }

      // パスワードハッシュ化
      const hashedPassword = await bcrypt.hash(password, 12)

      // ユーザー作成
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          companyId,
          role: invitationToken ? 'EMPLOYEE' : 'ADMIN'
        },
        include: {
          company: {
            select: { id: true, name: true }
          }
        }
      })

      // 管理者の場合は会社の管理者IDを更新
      if (user.role === 'ADMIN') {
        await prisma.company.update({
          where: { id: companyId },
          data: { adminId: user.id }
        })
      }

      // トークン生成
      const accessToken = jwt.sign(
        { userId: user.id, role: user.role, companyId: user.companyId },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      )

      const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
      )

      // セッション保存
      await prisma.session.create({
        data: {
          userId: user.id,
          token: refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      })

      // レスポンス
      const { password: _, ...userWithoutPassword } = user

      res.status(201).json({
        success: true,
        data: {
          user: userWithoutPassword,
          accessToken,
          refreshToken
        }
      })
    } catch (error) {
      next(error)
    }
  },

  // ログアウト
  logout: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '')
      
      if (token) {
        // セッションを削除
        await prisma.session.deleteMany({
          where: { token }
        })
      }

      res.json({
        success: true,
        message: 'ログアウトしました'
      })
    } catch (error) {
      next(error)
    }
  },

  // トークンリフレッシュ
  refreshToken: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body

      if (!refreshToken) {
        throw new BadRequestError('リフレッシュトークンが必要です')
      }

      // セッションの確認
      const session = await prisma.session.findUnique({
        where: { token: refreshToken },
        include: { user: true }
      })

      if (!session || session.expiresAt < new Date()) {
        throw new UnauthorizedError('無効なリフレッシュトークンです')
      }

      // 新しいトークンを生成
      const accessToken = jwt.sign(
        { userId: session.userId, role: session.user.role, companyId: session.user.companyId },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      )

      const newRefreshToken = jwt.sign(
        { userId: session.userId },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
      )

      // セッションを更新
      await prisma.session.update({
        where: { id: session.id },
        data: {
          token: newRefreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      })

      res.json({
        success: true,
        data: {
          accessToken,
          refreshToken: newRefreshToken
        }
      })
    } catch (error) {
      next(error)
    }
  },

  // トークン検証
  validateToken: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '')
      
      if (!token) {
        throw new UnauthorizedError('認証トークンが必要です')
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, name: true, role: true, isActive: true }
      })

      if (!user || !user.isActive) {
        throw new UnauthorizedError('無効なユーザーです')
      }

      res.json({
        success: true,
        data: { user, valid: true }
      })
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({
          success: false,
          error: '無効なトークンです'
        })
      }
      next(error)
    }
  },

  // プレースホルダー実装
  sendOtp: async (req: Request, res: Response, next: NextFunction) => {
    res.json({ success: false, message: 'OTP機能は開発中です' })
  },

  verifyOtp: async (req: Request, res: Response, next: NextFunction) => {
    res.json({ success: false, message: 'OTP機能は開発中です' })
  },

  requestPasswordReset: async (req: Request, res: Response, next: NextFunction) => {
    res.json({ success: false, message: 'パスワードリセット機能は開発中です' })
  },

  resetPassword: async (req: Request, res: Response, next: NextFunction) => {
    res.json({ success: false, message: 'パスワードリセット機能は開発中です' })
  },

  enableBiometricAuth: async (req: Request, res: Response, next: NextFunction) => {
    res.json({ success: false, message: '生体認証機能は開発中です' })
  },

  biometricLogin: async (req: Request, res: Response, next: NextFunction) => {
    res.json({ success: false, message: '生体認証機能は開発中です' })
  },
}