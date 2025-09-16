import { Request, Response } from 'express'
import prisma from '../services/database.js'
import bcrypt from 'bcryptjs'

// ユーザー一覧取得（管理者専用）
export const getUsers = async (req: Request, res: Response) => {
  try {
    const { companyId, role } = req.user!

    // 管理者チェック
    if (role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: '管理者権限が必要です'
      })
    }

    const users = await prisma.user.findMany({
      where: { companyId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        phone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json({
      success: true,
      data: { users }
    })
  } catch (error) {
    console.error('ユーザー一覧取得エラー:', error)
    res.status(500).json({
      success: false,
      error: 'サーバーエラーが発生しました'
    })
  }
}

// ユーザー作成（管理者専用）
export const createUser = async (req: Request, res: Response) => {
  try {
    const { companyId, role: userRole } = req.user!
    const { email, password, name, role, phone, avatar } = req.body

    // 管理者チェック
    if (userRole !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: '管理者権限が必要です'
      })
    }

    // バリデーション
    if (!email || !password || !name || !role) {
      return res.status(400).json({
        success: false,
        error: 'メールアドレス、パスワード、名前、役割は必須です'
      })
    }

    // メールアドレス重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'このメールアドレスは既に使用されています'
      })
    }

    // パスワードハッシュ化
    const hashedPassword = await bcrypt.hash(password, 12)

    // ユーザー作成
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        phone,
        avatar,
        companyId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        phone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    res.status(201).json({
      success: true,
      data: { user },
      message: 'ユーザーが正常に作成されました'
    })
  } catch (error) {
    console.error('ユーザー作成エラー:', error)
    res.status(500).json({
      success: false,
      error: 'サーバーエラーが発生しました'
    })
  }
}

// ユーザー詳細取得
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { companyId, userId, role } = req.user!

    // 本人または管理者のみ参照可能
    if (id !== userId && role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'アクセス権限がありません'
      })
    }

    const user = await prisma.user.findFirst({
      where: { 
        id,
        companyId 
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        phone: true,
        isActive: true,
        biometricEnabled: true,
        notificationEmail: true,
        notificationPush: true,
        notificationSms: true,
        createdAt: true,
        updatedAt: true,
        company: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'ユーザーが見つかりません'
      })
    }

    res.json({
      success: true,
      data: { user }
    })
  } catch (error) {
    console.error('ユーザー詳細取得エラー:', error)
    res.status(500).json({
      success: false,
      error: 'サーバーエラーが発生しました'
    })
  }
}

// ユーザー情報更新
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { companyId, userId, role } = req.user!
    const { name, email, phone, avatar, isActive, notificationEmail, notificationPush, notificationSms } = req.body

    // 本人または管理者のみ更新可能
    if (id !== userId && role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'アクセス権限がありません'
      })
    }

    // 更新データの準備
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email
    if (phone !== undefined) updateData.phone = phone
    if (avatar !== undefined) updateData.avatar = avatar
    if (notificationEmail !== undefined) updateData.notificationEmail = notificationEmail
    if (notificationPush !== undefined) updateData.notificationPush = notificationPush
    if (notificationSms !== undefined) updateData.notificationSms = notificationSms
    
    // 管理者のみ活性化状態変更可能
    if (isActive !== undefined && role === 'ADMIN') {
      updateData.isActive = isActive
    }

    const user = await prisma.user.update({
      where: { 
        id,
        companyId 
      },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        phone: true,
        isActive: true,
        biometricEnabled: true,
        notificationEmail: true,
        notificationPush: true,
        notificationSms: true,
        updatedAt: true
      }
    })

    res.json({
      success: true,
      data: { user }
    })
  } catch (error) {
    console.error('ユーザー更新エラー:', error)
    res.status(500).json({
      success: false,
      error: 'サーバーエラーが発生しました'
    })
  }
}

// ユーザー削除（管理者専用）
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { companyId, role } = req.user!

    if (role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: '管理者権限が必要です'
      })
    }

    await prisma.user.delete({
      where: { 
        id,
        companyId 
      }
    })

    res.json({
      success: true,
      message: 'ユーザーを削除しました'
    })
  } catch (error) {
    console.error('ユーザー削除エラー:', error)
    res.status(500).json({
      success: false,
      error: 'サーバーエラーが発生しました'
    })
  }
}

// 自分のプロフィール取得
export const getMyProfile = async (req: Request, res: Response) => {
  try {
    const { userId, companyId } = req.user!

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        phone: true,
        isActive: true,
        biometricEnabled: true,
        notificationEmail: true,
        notificationPush: true,
        notificationSms: true,
        createdAt: true,
        updatedAt: true,
        company: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'ユーザーが見つかりません'
      })
    }

    res.json({
      success: true,
      data: { user }
    })
  } catch (error) {
    console.error('プロフィール取得エラー:', error)
    res.status(500).json({
      success: false,
      error: 'サーバーエラーが発生しました'
    })
  }
}

// 自分のプロフィール更新
export const updateMyProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.user!
    const { name, email, phone, avatar, notificationEmail, notificationPush, notificationSms } = req.body

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email
    if (phone !== undefined) updateData.phone = phone
    if (avatar !== undefined) updateData.avatar = avatar
    if (notificationEmail !== undefined) updateData.notificationEmail = notificationEmail
    if (notificationPush !== undefined) updateData.notificationPush = notificationPush
    if (notificationSms !== undefined) updateData.notificationSms = notificationSms

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        phone: true,
        isActive: true,
        biometricEnabled: true,
        notificationEmail: true,
        notificationPush: true,
        notificationSms: true,
        updatedAt: true
      }
    })

    res.json({
      success: true,
      data: { user }
    })
  } catch (error) {
    console.error('プロフィール更新エラー:', error)
    res.status(500).json({
      success: false,
      error: 'サーバーエラーが発生しました'
    })
  }
}

// パスワード変更
export const changePassword = async (req: Request, res: Response) => {
  try {
    const { userId } = req.user!
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: '現在のパスワードと新しいパスワードが必要です'
      })
    }

    // 現在のパスワードを確認
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true }
    })

    if (!user || !await bcrypt.compare(currentPassword, user.password)) {
      return res.status(400).json({
        success: false,
        error: '現在のパスワードが正しくありません'
      })
    }

    // 新しいパスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    })

    res.json({
      success: true,
      message: 'パスワードを変更しました'
    })
  } catch (error) {
    console.error('パスワード変更エラー:', error)
    res.status(500).json({
      success: false,
      error: 'サーバーエラーが発生しました'
    })
  }
}

export const userController = {
  getUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  getMyProfile,
  updateMyProfile,
  changePassword
}