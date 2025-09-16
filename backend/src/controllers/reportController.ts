import { Request, Response } from 'express'
import prisma from '../services/database.js'

// 日報一覧取得
export const getReports = async (req: Request, res: Response) => {
  try {
    const { companyId, userId, role } = req.user!
    const { year, month, startDate, endDate } = req.query

    const where: any = { companyId }
    
    // 従業員は自分の日報のみ参照可能
    if (role === 'EMPLOYEE') {
      where.userId = userId
    }

    // 日付フィルター
    if (year && month) {
      const start = new Date(Number(year), Number(month) - 1, 1)
      const end = new Date(Number(year), Number(month), 0, 23, 59, 59)
      where.date = {
        gte: start,
        lte: end
      }
    } else if (startDate && endDate) {
      where.date = {
        gte: new Date(String(startDate)),
        lte: new Date(String(endDate))
      }
    }

    const reports = await prisma.dailyReport.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        location: {
          select: {
            id: true,
            name: true,
            address: true
          }
        }
      },
      orderBy: { date: 'desc' }
    })

    res.json({
      success: true,
      data: { reports }
    })
  } catch (error) {
    console.error('日報一覧取得エラー:', error)
    res.status(500).json({
      success: false,
      error: 'サーバーエラーが発生しました'
    })
  }
}

// 日報詳細取得
export const getReportById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { companyId, userId, role } = req.user!

    const where: any = { id, companyId }
    
    // 従業員は自分の日報のみ参照可能
    if (role === 'EMPLOYEE') {
      where.userId = userId
    }

    const report = await prisma.dailyReport.findFirst({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        location: {
          select: {
            id: true,
            name: true,
            address: true
          }
        }
      }
    })

    if (!report) {
      return res.status(404).json({
        success: false,
        error: '日報が見つかりません'
      })
    }

    res.json({
      success: true,
      data: { report }
    })
  } catch (error) {
    console.error('日報詳細取得エラー:', error)
    res.status(500).json({
      success: false,
      error: 'サーバーエラーが発生しました'
    })
  }
}

// 日報作成・更新
export const saveReport = async (req: Request, res: Response) => {
  try {
    const { companyId, userId } = req.user!
    const { 
      date, 
      locationId, 
      paymentType, 
      dailyAmount, 
      pieceRateItems, 
      totalAmount,
      photos, 
      notes 
    } = req.body

    if (!date || !locationId || !paymentType) {
      return res.status(400).json({
        success: false,
        error: '日付、勤務地、支払いタイプは必須です'
      })
    }

    const reportDate = new Date(date)
    reportDate.setHours(0, 0, 0, 0)

    // 既存の日報チェック
    const existingReport = await prisma.dailyReport.findFirst({
      where: {
        userId,
        date: reportDate
      }
    })

    const reportData = {
      userId,
      companyId,
      locationId,
      date: reportDate,
      paymentType,
      dailyAmount: paymentType === 'DAILY_RATE' ? dailyAmount : null,
      pieceRateItems: paymentType === 'PIECE_RATE' ? JSON.stringify(pieceRateItems) : null,
      totalAmount: paymentType === 'PIECE_RATE' ? totalAmount : dailyAmount,
      photos: JSON.stringify(photos || []),
      notes: notes || '',
      submittedAt: new Date()
    }

    let report

    if (existingReport) {
      // 更新
      report = await prisma.dailyReport.update({
        where: { id: existingReport.id },
        data: reportData,
        include: {
          location: {
            select: {
              id: true,
              name: true,
              address: true
            }
          }
        }
      })
    } else {
      // 新規作成
      report = await prisma.dailyReport.create({
        data: reportData,
        include: {
          location: {
            select: {
              id: true,
              name: true,
              address: true
            }
          }
        }
      })
    }

    res.status(existingReport ? 200 : 201).json({
      success: true,
      data: { report }
    })
  } catch (error) {
    console.error('日報保存エラー:', error)
    res.status(500).json({
      success: false,
      error: 'サーバーエラーが発生しました'
    })
  }
}

// 日報削除
export const deleteReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { companyId, userId, role } = req.user!

    const where: any = { id, companyId }
    
    // 従業員は自分の日報のみ削除可能
    if (role === 'EMPLOYEE') {
      where.userId = userId
    }

    const report = await prisma.dailyReport.findFirst({ where })

    if (!report) {
      return res.status(404).json({
        success: false,
        error: '日報が見つかりません'
      })
    }

    await prisma.dailyReport.delete({
      where: { id }
    })

    res.json({
      success: true,
      message: '日報を削除しました'
    })
  } catch (error) {
    console.error('日報削除エラー:', error)
    res.status(500).json({
      success: false,
      error: 'サーバーエラーが発生しました'
    })
  }
}

// 日報統計取得
export const getReportStats = async (req: Request, res: Response) => {
  try {
    const { companyId, userId, role } = req.user!
    const { year, month } = req.query

    const where: any = { companyId }
    
    // 従業員は自分のデータのみ
    if (role === 'EMPLOYEE') {
      where.userId = userId
    }

    // 月指定
    if (year && month) {
      const start = new Date(Number(year), Number(month) - 1, 1)
      const end = new Date(Number(year), Number(month), 0, 23, 59, 59)
      where.date = {
        gte: start,
        lte: end
      }
    }

    const reports = await prisma.dailyReport.findMany({
      where,
      select: {
        userId: true,
        totalAmount: true,
        paymentType: true,
        date: true,
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // 統計計算
    const userStats = reports.reduce((acc: any, report) => {
      const userId = report.userId
      if (!acc[userId]) {
        acc[userId] = {
          userId,
          userName: report.user.name,
          totalReports: 0,
          totalEarnings: 0,
          dailyRateCount: 0,
          pieceRateCount: 0
        }
      }
      
      acc[userId].totalReports++
      acc[userId].totalEarnings += report.totalAmount || 0
      
      if (report.paymentType === 'DAILY_RATE') {
        acc[userId].dailyRateCount++
      } else if (report.paymentType === 'PIECE_RATE') {
        acc[userId].pieceRateCount++
      }
      
      return acc
    }, {})

    const stats = Object.values(userStats)

    res.json({
      success: true,
      data: { stats }
    })
  } catch (error) {
    console.error('日報統計取得エラー:', error)
    res.status(500).json({
      success: false,
      error: 'サーバーエラーが発生しました'
    })
  }
}

// 本日の日報取得
export const getTodayReport = async (req: Request, res: Response) => {
  try {
    const { userId } = req.user!

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const report = await prisma.dailyReport.findFirst({
      where: {
        userId,
        date: {
          gte: today,
          lt: tomorrow
        }
      },
      include: {
        location: {
          select: {
            id: true,
            name: true,
            address: true
          }
        }
      }
    })

    res.json({
      success: true,
      data: { report }
    })
  } catch (error) {
    console.error('本日の日報取得エラー:', error)
    res.status(500).json({
      success: false,
      error: 'サーバーエラーが発生しました'
    })
  }
}

export const reportController = {
  getReports,
  getReportById,
  saveReport,
  deleteReport,
  getReportStats,
  getTodayReport
}