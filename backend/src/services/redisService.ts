import Redis from 'redis'

let redisClient: ReturnType<typeof Redis.createClient> | null = null

export async function connectRedis() {
  try {
    if (!redisClient) {
      redisClient = Redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        socket: {
          connectTimeout: 2000, // 2 seconds timeout
          lazyConnect: true
        },
        retry_strategy: (options) => {
          // Fail fast on connection refused
          if (options.error && options.error.code === 'ECONNREFUSED') {
            return new Error('The server refused the connection')
          }
          // Only retry 2 times max
          if (options.attempt > 2) {
            return undefined
          }
          return 1000 // 1 second between retries
        }
      })

      redisClient.on('error', (err) => {
        console.error('Redis error:', err)
      })

      redisClient.on('connect', () => {
        console.log('Redis connected')
      })

      // Set a timeout for the connection attempt
      const connectPromise = redisClient.connect()
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Redis connection timeout')), 3000)
      )
      
      await Promise.race([connectPromise, timeoutPromise])
    }
    return redisClient
  } catch (error) {
    console.error('Redis connection failed:', error)
    // Redis接続に失敗してもアプリケーションは続行
    return null
  }
}

export function getRedisClient() {
  return redisClient
}

export async function disconnectRedis() {
  if (redisClient) {
    await redisClient.quit()
    redisClient = null
  }
}