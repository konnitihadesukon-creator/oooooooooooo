import { PrismaClient } from '@prisma/client'

// Prismaクライアントのシングルトンインスタンス
declare global {
  var __prisma: PrismaClient | undefined
}

export const prisma = globalThis.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['warn', 'error'],
  errorFormat: 'pretty',
})

// 開発環境では既存のインスタンスを再利用してホットリロード時の接続問題を避ける
if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma
}

// データベース接続テスト
export async function connectDatabase() {
  try {
    await prisma.$connect()
    console.log('✅ Database connected successfully')
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    throw error
  }
}

// データベース切断
export async function disconnectDatabase() {
  try {
    await prisma.$disconnect()
    console.log('✅ Database disconnected successfully')
  } catch (error) {
    console.error('❌ Database disconnection failed:', error)
  }
}

export default prisma