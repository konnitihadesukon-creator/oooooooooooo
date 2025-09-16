import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'

// データベース接続
import { connectDatabase } from './services/database.js'

// ミドルウェア・ルートのインポート
import { errorHandler } from './middleware/errorHandler.js'
import { notFound } from './middleware/notFound.js'
import { rateLimiter } from './middleware/rateLimiter.js'

// ルーターのインポート
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import companyRoutes from './routes/companies.js'
import shiftRoutes from './routes/shifts.js'
import reportRoutes from './routes/reports.js'
import locationRoutes from './routes/locations.js'
import attendanceRoutes from './routes/attendance.js'
import chatRoutes from './routes/chat.js'
import notificationRoutes from './routes/notifications.js'

// サービスのインポート
import { initializeSocket } from './services/socketService.js'
import { initializeCronJobs } from './services/cronService.js'
import { connectRedis } from './services/redisService.js'

// 環境変数の読み込み
dotenv.config()

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

// グローバルに io を保存（通知送信用）
;(global as any).io = io

const PORT = process.env.PORT || 3001

// 基本ミドルウェア
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
      scriptSrc: ["'self'"],
    },
  },
}))

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}))

app.use(compression())
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// レート制限
app.use(rateLimiter)

// ヘルスチェックエンドポイント
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
  })
})

// API ルーティング
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/companies', companyRoutes)
app.use('/api/shifts', shiftRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/locations', locationRoutes)
app.use('/api/attendance', attendanceRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/notifications', notificationRoutes)

// エラーハンドリングミドルウェア
app.use(notFound)
app.use(errorHandler)

// サーバー起動時の初期化処理
async function startServer() {
  try {
    // データベース接続
    await connectDatabase()
    console.log('✅ Database connected')

    // Redis接続（オプショナル）
    try {
      await connectRedis()
      console.log('✅ Redis connected')
    } catch (error) {
      console.log('⚠️ Redis connection failed, continuing without Redis')
    }

    // Socket.IO初期化
    initializeSocket(io)
    console.log('✅ Socket.IO initialized')

    // Cronジョブ初期化
    initializeCronJobs()
    console.log('✅ Cron jobs initialized')

    // サーバー起動
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`)
      console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`)
      console.log(`💾 Database: ${process.env.DATABASE_URL ? '[CONFIGURED]' : '[NOT CONFIGURED]'}`)
      console.log(`🔗 API URL: http://localhost:${PORT}/api`)
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`)
    })

  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

// プロセス終了時のクリーンアップ
const gracefulShutdown = (signal: string) => {
  console.log(`🛑 ${signal} received, shutting down gracefully...`)
  server.close(() => {
    console.log('✅ Server closed')
    process.exit(0)
  })
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// 未捕捉例外のハンドリング
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

// サーバー起動
startServer()

export default app