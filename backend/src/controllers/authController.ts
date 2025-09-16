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

      // セッション保存（アクセストークンとリフレッシュトークンの両方）
      await prisma.session.create({
        data: {
          userId: user.id,
          token: accessToken, // アクセストークンを保存
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24時間後
        }
      })
      
      // リフレッシュトークン用のセッション
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
      const { email, password, name, role, invitationToken, companyName, generateInviteCode } = req.body

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
      let userRole: 'ADMIN' | 'EMPLOYEE'

      // 招待トークンがある場合の処理
      if (invitationToken) {
        const invitation = await prisma.tempToken.findFirst({
          where: {
            token: invitationToken,
            type: 'INVITATION',
            used: false,
            expiresAt: { gt: new Date() }
          },
          include: {
            // metadataから会社情報を取得するための処理
          }
        })

        if (!invitation) {
          throw new BadRequestError('無効または期限切れの招待コードです')
        }

        // 招待に指定された会社IDを取得
        let targetCompanyId: string
        try {
          const metadata = JSON.parse(invitation.metadata || '{}')
          targetCompanyId = metadata.companyId
        } catch {
          // メタデータが解析できない場合は最初の会社を使用
          const company = await prisma.company.findFirst()
          if (!company) {
            throw new BadRequestError('会社が見つかりません')
          }
          targetCompanyId = company.id
        }

        // 会社の存在確認
        const company = await prisma.company.findUnique({
          where: { id: targetCompanyId }
        })

        if (!company) {
          throw new BadRequestError('招待された会社が見つかりません')
        }

        companyId = company.id
        userRole = 'EMPLOYEE' // 招待の場合は従業員固定

        // 招待トークンを使用済みにする
        await prisma.tempToken.update({
          where: { id: invitation.id },
          data: { used: true }
        })
      } else {
        // ロールの検証（招待なしの場合）
        if (!role || (role !== 'ADMIN' && role !== 'EMPLOYEE')) {
          throw new BadRequestError('有効なロール（ADMIN または EMPLOYEE）を選択してください')
        }

        userRole = role

        if (userRole === 'ADMIN') {
          // 管理者の場合は企業名が必須
          if (!companyName || companyName.trim() === '') {
            throw new BadRequestError('管理者登録には企業名が必要です')
          }

          // 新規会社作成（管理者の場合）
          const company = await prisma.company.create({
            data: {
              name: companyName.trim(),
              adminId: 'temp' // 一時的なID
            }
          })
          companyId = company.id
        } else {
          // 従業員の場合は既存の会社に所属させる
          const company = await prisma.company.findFirst({
            orderBy: { createdAt: 'desc' } // 最新の会社を取得
          })
          if (!company) {
            throw new BadRequestError('会社が見つかりません。最初に管理者アカウントを作成してください')
          }
          companyId = company.id
        }
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
          role: userRole
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

        // 初期招待コード生成（オプション）
        if (generateInviteCode) {
          const inviteCode = crypto.randomBytes(4).toString('hex').toUpperCase()
          const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7日後

          await prisma.tempToken.create({
            data: {
              email: user.email,
              token: inviteCode,
              type: 'INVITATION',
              expiresAt,
              used: false,
              metadata: JSON.stringify({
                companyId: companyId,
                createdBy: user.id
              })
            }
          })
        }
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

      // アクセストークンセッション保存
      await prisma.session.create({
        data: {
          userId: user.id,
          token: accessToken,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24時間
        }
      })
      
      // リフレッシュトークンセッション保存
      await prisma.session.create({
        data: {
          userId: user.id,
          token: refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7日後
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

  // 招待コード生成（管理者用）
  generateInviteCode: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // 管理者権限チェック
      if (!req.user || req.user.role !== 'ADMIN') {
        throw new UnauthorizedError('管理者権限が必要です')
      }

      // 招待コード生成（8文字のランダム文字列）
      const inviteCode = crypto.randomBytes(4).toString('hex').toUpperCase()
      
      // 有効期限を設定（7日後）
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

      // 招待トークンをデータベースに保存
      const invitation = await prisma.tempToken.create({
        data: {
          email: req.user.email || '', // 作成者のメール（不明な場合は空文字）
          token: inviteCode,
          type: 'INVITATION',
          expiresAt,
          used: false,
          metadata: JSON.stringify({
            companyId: req.user.companyId,
            createdBy: req.user.userId
          })
        }
      })

      res.json({
        success: true,
        data: {
          inviteCode,
          expiresAt,
          id: invitation.id
        }
      })
    } catch (error) {
      next(error)
    }
  },

  // 招待コード一覧取得（管理者用）
  getInviteCodes: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // 管理者権限チェック
      if (!req.user || req.user.role !== 'ADMIN') {
        throw new UnauthorizedError('管理者権限が必要です')
      }

      // 現在有効な招待コードを取得
      const inviteCodes = await prisma.tempToken.findMany({
        where: {
          type: 'INVITATION',
          expiresAt: { gt: new Date() }
        },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          token: true,
          expiresAt: true,
          used: true,
          createdAt: true,
          metadata: true
        }
      })

      // 使用済み招待コードの統計
      const usedCount = await prisma.tempToken.count({
        where: {
          type: 'INVITATION',
          used: true
        }
      })

      res.json({
        success: true,
        data: {
          inviteCodes,
          statistics: {
            total: inviteCodes.length,
            used: usedCount,
            active: inviteCodes.filter(code => !code.used).length
          }
        }
      })
    } catch (error) {
      next(error)
    }
  },

  // 招待コード無効化（管理者用）
  revokeInviteCode: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // 管理者権限チェック
      if (!req.user || req.user.role !== 'ADMIN') {
        throw new UnauthorizedError('管理者権限が必要です')
      }

      const { codeId } = req.params

      // 招待コードの存在確認
      const invitation = await prisma.tempToken.findUnique({
        where: { id: codeId }
      })

      if (!invitation || invitation.type !== 'INVITATION') {
        throw new NotFoundError('招待コードが見つかりません')
      }

      // 招待コードを期限切れに設定（無効化）
      await prisma.tempToken.update({
        where: { id: codeId },
        data: { expiresAt: new Date() }
      })

      res.json({
        success: true,
        message: '招待コードを無効化しました'
      })
    } catch (error) {
      next(error)
    }
  },

  // パブリック招待コード一覧（認証不要）
  getPublicInviteCodes: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 現在有効な招待コードを取得（認証不要、公開API）
      const inviteCodes = await prisma.tempToken.findMany({
        where: {
          type: 'INVITATION',
          used: false,
          expiresAt: { gt: new Date() }
        },
        orderBy: { createdAt: 'desc' },
        select: {
          token: true,
          expiresAt: true,
          createdAt: true
        }
      })

      res.json({
        success: true,
        data: {
          inviteCodes,
          count: inviteCodes.length
        }
      })
    } catch (error) {
      next(error)
    }
  },
}