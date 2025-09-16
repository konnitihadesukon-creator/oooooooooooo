import { Request, Response, NextFunction } from 'express'
import { Prisma } from '@prisma/client'

export interface AppError extends Error {
  statusCode?: number
  status?: string
  isOperational?: boolean
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err }
  error.message = err.message

  // ログ出力
  console.error(`Error: ${error.message}`)
  if (error.stack) {
    console.error(error.stack)
  }

  // Prisma エラーハンドリング
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      // Unique constraint violation
      const field = err.meta?.target as string[]
      error.message = `${field?.[0] || 'フィールド'}は既に存在します`
      error.statusCode = 409
    } else if (err.code === 'P2025') {
      // Record not found
      error.message = 'リソースが見つかりません'
      error.statusCode = 404
    } else if (err.code === 'P2003') {
      // Foreign key constraint violation
      error.message = '関連するリソースが見つかりません'
      error.statusCode = 400
    } else {
      error.message = 'データベースエラーが発生しました'
      error.statusCode = 500
    }
  }

  // Prisma Validation Error
  if (err instanceof Prisma.PrismaClientValidationError) {
    error.message = 'データの形式が正しくありません'
    error.statusCode = 400
  }

  // JWT エラー
  if (err.name === 'JsonWebTokenError') {
    error.message = '認証トークンが無効です'
    error.statusCode = 401
  }

  if (err.name === 'TokenExpiredError') {
    error.message = '認証トークンの有効期限が切れています'
    error.statusCode = 401
  }

  // Multer エラー（ファイルアップロード）
  if (err.name === 'MulterError') {
    if (err.message.includes('File too large')) {
      error.message = 'ファイルサイズが大きすぎます'
      error.statusCode = 413
    } else {
      error.message = 'ファイルアップロードでエラーが発生しました'
      error.statusCode = 400
    }
  }

  // Validation エラー (Joi)
  if (err.name === 'ValidationError') {
    error.message = 'バリデーションエラー'
    error.statusCode = 400
  }

  // デフォルトエラー
  const statusCode = error.statusCode || 500
  const message = error.message || 'サーバーエラーが発生しました'

  // 開発環境では詳細なエラー情報を返す
  const errorResponse = {
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: error,
    }),
  }

  res.status(statusCode).json(errorResponse)
}

// カスタムエラークラス
export class CustomError extends Error implements AppError {
  statusCode: number
  status: string
  isOperational: boolean

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}

// よく使用されるエラー
export class BadRequestError extends CustomError {
  constructor(message = 'リクエストが正しくありません') {
    super(message, 400)
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message = '認証が必要です') {
    super(message, 401)
  }
}

export class ForbiddenError extends CustomError {
  constructor(message = 'アクセス権限がありません') {
    super(message, 403)
  }
}

export class NotFoundError extends CustomError {
  constructor(message = 'リソースが見つかりません') {
    super(message, 404)
  }
}

export class ConflictError extends CustomError {
  constructor(message = '競合が発生しました') {
    super(message, 409)
  }
}

export class InternalServerError extends CustomError {
  constructor(message = 'サーバーエラーが発生しました') {
    super(message, 500)
  }
}