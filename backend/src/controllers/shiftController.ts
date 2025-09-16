import { Request, Response } from 'express'
import prisma from '../services/database.js'

// シフト一覧取得
export const getShifts = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!
    const { year, month } = req.query

    // クエリ条件
    const where: any = { companyId }
    if (year && month) {
      where.month = `${year}-${String(month).padStart(2, '0')}`
    }

    const shifts = await prisma.shift.findMany({
      where,
      include: {
        _count: {
          select: {
            slots: true
          }
        }
      },
      orderBy: { month: 'desc' }
    })

    res.json({
      success: true,
      data: { shifts }
    })
  } catch (error) {
    console.error('シフト一覧取得エラー:', error)
    res.status(500).json({
      success: false,
      error: 'サーバーエラーが発生しました'
    })
  }
}

// シフト詳細取得
export const getShiftById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { companyId } = req.user!

    const shift = await prisma.shift.findFirst({
      where: { 
        id,
        companyId 
      },
      include: {
        slots: {
          include: {
            location: true,
            assignments: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true
                  }
                }
              }
            }
          },
          orderBy: { date: 'asc' }
        }
      }
    })

    if (!shift) {
      return res.status(404).json({
        success: false,
        error: 'シフトが見つかりません'
      })
    }

    res.json({
      success: true,
      data: { shift }
    })
  } catch (error) {
    console.error('シフト詳細取得エラー:', error)
    res.status(500).json({
      success: false,
      error: 'サーバーエラーが発生しました'
    })
  }
}

// シフト作成（管理者専用）
export const createShift = async (req: Request, res: Response) => {
  try {
    const { companyId, role } = req.user!
    const { month, slots } = req.body

    if (role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: '管理者権限が必要です'
      })
    }

    // 既存シフトのチェック
    const existingShift = await prisma.shift.findFirst({
      where: { companyId, month }
    })

    if (existingShift) {
      return res.status(400).json({
        success: false,
        error: '指定された月のシフトは既に存在します'
      })
    }

    const shift = await prisma.shift.create({
      data: {
        companyId,
        month,
        status: 'DRAFT',
        slots: {
          create: slots?.map((slot: any) => ({
            locationId: slot.locationId,
            date: new Date(slot.date),
            requiredCount: slot.requiredCount,
            priority: slot.priority || 'NORMAL',
            isPublic: slot.isPublic || false
          })) || []
        }
      },
      include: {
        slots: {
          include: {
            location: true
          }
        }
      }
    })

    res.status(201).json({
      success: true,
      data: { shift }
    })
  } catch (error) {
    console.error('シフト作成エラー:', error)
    res.status(500).json({
      success: false,
      error: 'サーバーエラーが発生しました'
    })
  }
}

// シフト公開（管理者専用）
export const publishShift = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { companyId, role } = req.user!

    if (role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: '管理者権限が必要です'
      })
    }

    const shift = await prisma.shift.update({
      where: { 
        id,
        companyId 
      },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date()
      },
      include: {
        slots: {
          include: {
            location: true,
            assignments: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    })

    // 通知の作成
    const employees = await prisma.user.findMany({
      where: {
        companyId,
        role: 'EMPLOYEE',
        isActive: true
      },
      select: { id: true }
    })

    // 従業員全員に通知
    const notifications = employees.map(employee => ({
      userId: employee.id,
      companyId,
      type: 'SHIFT_PUBLISHED',
      title: 'シフト公開のお知らせ',
      content: `${shift.month}月のシフトが公開されました。ご確認ください。`,
      data: JSON.stringify({ shiftId: shift.id })
    }))

    await prisma.notification.createMany({
      data: notifications
    })

    res.json({
      success: true,
      data: { shift }
    })
  } catch (error) {
    console.error('シフト公開エラー:', error)
    res.status(500).json({
      success: false,
      error: 'サーバーエラーが発生しました'
    })
  }
}

// シフト希望取得
export const getShiftRequests = async (req: Request, res: Response) => {
  try {
    const { companyId, userId, role } = req.user!
    const { year, month } = req.query

    const where: any = { companyId }
    
    // 従業員は自分の希望のみ参照可能
    if (role === 'EMPLOYEE') {
      where.userId = userId
    }
    
    if (year && month) {
      where.month = `${year}-${String(month).padStart(2, '0')}`
    }

    const requests = await prisma.shiftRequest.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      },
      orderBy: { submittedAt: 'desc' }
    })

    res.json({
      success: true,
      data: { requests }
    })
  } catch (error) {
    console.error('シフト希望取得エラー:', error)
    res.status(500).json({
      success: false,
      error: 'サーバーエラーが発生しました'
    })
  }
}

// シフト希望提出
export const submitShiftRequest = async (req: Request, res: Response) => {
  try {
    const { companyId, userId } = req.user!
    const { month, dates, comment } = req.body

    if (!month || !dates) {
      return res.status(400).json({
        success: false,
        error: '月と希望日程が必要です'
      })
    }

    // 既存の希望をチェック
    const existingRequest = await prisma.shiftRequest.findFirst({
      where: { userId, month }
    })

    let request

    if (existingRequest) {
      // 更新
      request = await prisma.shiftRequest.update({
        where: { id: existingRequest.id },
        data: {
          dates: JSON.stringify(dates),
          comment,
          submittedAt: new Date()
        }
      })
    } else {
      // 新規作成
      request = await prisma.shiftRequest.create({
        data: {
          userId,
          companyId,
          month,
          dates: JSON.stringify(dates),
          comment,
          submittedAt: new Date()
        }
      })
    }

    res.json({
      success: true,
      data: { request }
    })
  } catch (error) {
    console.error('シフト希望提出エラー:', error)
    res.status(500).json({
      success: false,
      error: 'サーバーエラーが発生しました'
    })
  }
}

// シフト割り当て（管理者専用）
export const assignShift = async (req: Request, res: Response) => {
  try {
    const { companyId, role } = req.user!
    const { slotId, userId, isConfirmed } = req.body

    if (role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: '管理者権限が必要です'
      })
    }

    // スロットの存在チェック
    const slot = await prisma.shiftSlot.findFirst({
      where: {
        id: slotId,
        shift: { companyId }
      }
    })

    if (!slot) {
      return res.status(404).json({
        success: false,
        error: 'シフトスロットが見つかりません'
      })
    }

    // 既存の割り当てチェック
    const existingAssignment = await prisma.shiftAssignment.findFirst({
      where: { slotId, userId }
    })

    let assignment

    if (existingAssignment) {
      // 更新
      assignment = await prisma.shiftAssignment.update({
        where: { id: existingAssignment.id },
        data: { isConfirmed: isConfirmed || false }
      })
    } else {
      // 新規作成
      assignment = await prisma.shiftAssignment.create({
        data: {
          slotId,
          userId,
          isConfirmed: isConfirmed || false
        }
      })
    }

    res.json({
      success: true,
      data: { assignment }
    })
  } catch (error) {
    console.error('シフト割り当てエラー:', error)
    res.status(500).json({
      success: false,
      error: 'サーバーエラーが発生しました'
    })
  }
}

export const shiftController = {
  getShifts,
  getShiftById,
  createShift,
  publishShift,
  getShiftRequests,
  submitShiftRequest,
  assignShift
}