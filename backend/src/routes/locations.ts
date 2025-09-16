import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import prisma from '../services/database.js'

const router = Router()

// 全てのルートに認証が必要
router.use(authenticate)

// 営業所一覧取得
router.get('/', async (req, res) => {
  try {
    const { companyId } = req.user!

    const locations = await prisma.location.findMany({
      where: { 
        companyId,
        isActive: true 
      },
      orderBy: { name: 'asc' }
    })

    res.json({
      success: true,
      data: { locations }
    })
  } catch (error) {
    console.error('営業所一覧取得エラー:', error)
    res.status(500).json({
      success: false,
      error: 'サーバーエラーが発生しました'
    })
  }
})

// 営業所詳細取得
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { companyId } = req.user!

    const location = await prisma.location.findFirst({
      where: { 
        id,
        companyId 
      }
    })

    if (!location) {
      return res.status(404).json({
        success: false,
        error: '営業所が見つかりません'
      })
    }

    res.json({
      success: true,
      data: { location }
    })
  } catch (error) {
    console.error('営業所詳細取得エラー:', error)
    res.status(500).json({
      success: false,
      error: 'サーバーエラーが発生しました'
    })
  }
})

// 営業所作成（管理者専用）
router.post('/', async (req, res) => {
  try {
    const { companyId, role } = req.user!
    const { name, address, latitude, longitude } = req.body

    if (role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: '管理者権限が必要です'
      })
    }

    if (!name || !address) {
      return res.status(400).json({
        success: false,
        error: '営業所名と住所は必須です'
      })
    }

    const location = await prisma.location.create({
      data: {
        companyId,
        name,
        address,
        latitude: latitude || null,
        longitude: longitude || null
      }
    })

    res.status(201).json({
      success: true,
      data: { location }
    })
  } catch (error) {
    console.error('営業所作成エラー:', error)
    res.status(500).json({
      success: false,
      error: 'サーバーエラーが発生しました'
    })
  }
})

export default router