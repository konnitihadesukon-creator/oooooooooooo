import { Request, Response } from 'express'
import prisma from '../services/database.js'

// 勤怠記録取得
export const getAttendance = async (req: Request, res: Response) => {
  try {
    const { companyId, userId, role } = req.user!
    const { year, month, startDate, endDate } = req.query

    const where: any = { companyId }
    
    // 従業員は自分の記録のみ参照可能
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

    const records = await prisma.attendance.findMany({
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
      data: { records }
    })
  } catch (error) {
    console.error('勤怠記録取得エラー:', error)
    res.status(500).json({
      success: false,
      error: 'サーバーエラーが発生しました'
    })
  }
}

// 出勤記録
export const clockIn = async (req: Request, res: Response) => {
  try {
    const { companyId, userId } = req.user!
    const { locationId, latitude, longitude, address } = req.body

    if (!locationId) {
      return res.status(400).json({
        success: false,
        error: '勤務地の選択が必要です'
      })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // 既存の出勤記録チェック
    const existingRecord = await prisma.attendance.findFirst({
      where: {
        userId,
        date: {
          gte: today,
          lt: tomorrow
        }
      }
    })

    if (existingRecord) {
      return res.status(400).json({
        success: false,
        error: '本日の出勤記録は既に存在します'
      })
    }

    const record = await prisma.attendance.create({
      data: {
        userId,
        companyId,
        locationId,
        date: new Date(),
        clockInTime: new Date(),
        clockInLatitude: latitude || null,
        clockInLongitude: longitude || null,
        clockInAddress: address || null
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

    res.status(201).json({
      success: true,
      data: { record }
    })
  } catch (error) {
    console.error('出勤記録エラー:', error)
    res.status(500).json({
      success: false,
      error: 'サーバーエラーが発生しました'
    })
  }
}

// 退勤記録
export const clockOut = async (req: Request, res: Response) => {
  try {
    const { userId } = req.user!
    const { latitude, longitude, address } = req.body

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // 本日の出勤記録を取得
    const existingRecord = await prisma.attendance.findFirst({
      where: {
        userId,
        date: {
          gte: today,
          lt: tomorrow
        }
      }
    })

    if (!existingRecord) {
      return res.status(400).json({
        success: false,
        error: '出勤記録が見つかりません'
      })
    }

    if (existingRecord.clockOutTime) {
      return res.status(400).json({
        success: false,
        error: '既に退勤済みです'
      })
    }

    const clockOutTime = new Date()
    const workingMinutes = Math.floor(
      (clockOutTime.getTime() - existingRecord.clockInTime.getTime()) / (1000 * 60)
    )
    const overtimeMinutes = Math.max(0, workingMinutes - 480) // 8時間超過分

    const record = await prisma.attendance.update({
      where: { id: existingRecord.id },
      data: {
        clockOutTime,
        clockOutLatitude: latitude || null,
        clockOutLongitude: longitude || null,
        clockOutAddress: address || null,
        workingMinutes,
        overtimeMinutes
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
      data: { record }
    })
  } catch (error) {
    console.error('退勤記録エラー:', error)
    res.status(500).json({
      success: false,
      error: 'サーバーエラーが発生しました'
    })
  }
}

// 勤怠統計取得
export const getAttendanceStats = async (req: Request, res: Response) => {
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

    const records = await prisma.attendance.findMany({
      where,
      select: {
        userId: true,
        workingMinutes: true,
        overtimeMinutes: true,
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
    const userStats = records.reduce((acc: any, record) => {
      const userId = record.userId
      if (!acc[userId]) {
        acc[userId] = {
          userId,
          userName: record.user.name,
          totalDays: 0,
          totalHours: 0,
          totalOvertimeHours: 0
        }
      }
      
      acc[userId].totalDays++
      acc[userId].totalHours += Math.floor((record.workingMinutes || 0) / 60)
      acc[userId].totalOvertimeHours += Math.floor((record.overtimeMinutes || 0) / 60)
      
      return acc
    }, {})

    const stats = Object.values(userStats)

    res.json({
      success: true,
      data: { stats }
    })
  } catch (error) {
    console.error('勤怠統計取得エラー:', error)
    res.status(500).json({
      success: false,
      error: 'サーバーエラーが発生しました'
    })
  }
}

// 本日の勤怠状態取得
export const getTodayStatus = async (req: Request, res: Response) => {
  try {
    const { userId } = req.user!

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const record = await prisma.attendance.findFirst({
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

    let status = 'NOT_STARTED' // 未出勤
    if (record) {
      if (record.clockOutTime) {
        status = 'COMPLETED' // 退勤済み
      } else {
        status = 'WORKING' // 勤務中
      }
    }

    res.json({
      success: true,
      data: { 
        status,
        record 
      }
    })
  } catch (error) {
    console.error('本日の勤怠状態取得エラー:', error)
    res.status(500).json({
      success: false,
      error: 'サーバーエラーが発生しました'
    })
  }
}

export const attendanceController = {
  getAttendance,
  clockIn,
  clockOut,
  getAttendanceStats,
  getTodayStatus
}