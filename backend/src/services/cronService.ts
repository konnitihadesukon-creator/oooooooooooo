import cron from 'node-cron'
import prisma from './database.js'
import { sendNotificationToUser } from './socketService.js'

export function initializeCronJobs() {
  console.log('🕒 Initializing cron jobs...')

  // 毎日20時に日報未提出者にリマインド
  cron.schedule('0 20 * * *', async () => {
    try {
      console.log('📝 Running daily report reminder job...')
      
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // 今日の日報を提出していない従業員を検索
      const usersWithoutReport = await prisma.user.findMany({
        where: {
          role: 'EMPLOYEE',
          isActive: true,
          dailyReports: {
            none: {
              date: {
                gte: today,
                lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
              }
            }
          }
        }
      })

      // リマインド通知を送信
      for (const user of usersWithoutReport) {
        await prisma.notification.create({
          data: {
            userId: user.id,
            companyId: user.companyId,
            type: 'REPORT_REMINDER',
            title: '日報提出のお知らせ',
            content: '今日の日報をまだ提出していません。忘れずに提出してください。',
          }
        })

        // リアルタイム通知
        sendNotificationToUser(user.id, {
          type: 'REPORT_REMINDER',
          title: '日報提出のお知らせ',
          content: '今日の日報をまだ提出していません。'
        })
      }

      console.log(`📝 Daily report reminders sent to ${usersWithoutReport.length} users`)
    } catch (error) {
      console.error('Daily report reminder job failed:', error)
    }
  })

  // 毎月1日にシフト希望提出リマインド
  cron.schedule('0 9 1 * *', async () => {
    try {
      console.log('📅 Running shift request reminder job...')

      const nextMonth = new Date()
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      const monthString = nextMonth.toISOString().substring(0, 7) // YYYY-MM

      // 来月のシフト希望を提出していない従業員を検索
      const usersWithoutShiftRequest = await prisma.user.findMany({
        where: {
          role: 'EMPLOYEE',
          isActive: true,
          shiftRequests: {
            none: {
              month: monthString
            }
          }
        }
      })

      // リマインド通知を送信
      for (const user of usersWithoutShiftRequest) {
        await prisma.notification.create({
          data: {
            userId: user.id,
            companyId: user.companyId,
            type: 'SHIFT_REMINDER',
            title: 'シフト希望提出のお知らせ',
            content: `${nextMonth.getFullYear()}年${nextMonth.getMonth() + 1}月のシフト希望の提出をお忘れなく！`,
          }
        })

        sendNotificationToUser(user.id, {
          type: 'SHIFT_REMINDER',
          title: 'シフト希望提出のお知らせ',
          content: '来月のシフト希望の提出期限が近づいています。'
        })
      }

      console.log(`📅 Shift request reminders sent to ${usersWithoutShiftRequest.length} users`)
    } catch (error) {
      console.error('Shift request reminder job failed:', error)
    }
  })

  // 毎月15日にシフト希望提出期限リマインド
  cron.schedule('0 9 15 * *', async () => {
    try {
      console.log('⏰ Running shift deadline reminder job...')

      const nextMonth = new Date()
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      const monthString = nextMonth.toISOString().substring(0, 7)

      // シフト希望未提出者に最終リマインド
      const usersWithoutShiftRequest = await prisma.user.findMany({
        where: {
          role: 'EMPLOYEE',
          isActive: true,
          shiftRequests: {
            none: {
              month: monthString
            }
          }
        }
      })

      for (const user of usersWithoutShiftRequest) {
        await prisma.notification.create({
          data: {
            userId: user.id,
            companyId: user.companyId,
            type: 'SHIFT_REMINDER',
            title: 'シフト希望提出期限',
            content: '本日がシフト希望提出の期限です。今すぐ提出してください！',
          }
        })

        sendNotificationToUser(user.id, {
          type: 'SHIFT_REMINDER',
          title: 'シフト希望提出期限',
          content: '本日が提出期限です！'
        })
      }

      console.log(`⏰ Shift deadline reminders sent to ${usersWithoutShiftRequest.length} users`)
    } catch (error) {
      console.error('Shift deadline reminder job failed:', error)
    }
  })

  // 毎日午前0時にバッジ計算
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('🏆 Running badge calculation job...')
      
      // 今月の皆勤賞チェック
      const currentMonth = new Date().toISOString().substring(0, 7)
      const monthStart = new Date(currentMonth + '-01')
      const monthEnd = new Date(monthStart)
      monthEnd.setMonth(monthEnd.getMonth() + 1)

      const perfectAttendanceBadge = await prisma.badge.findFirst({
        where: { type: 'PERFECT_ATTENDANCE', period: 'MONTHLY' }
      })

      if (perfectAttendanceBadge) {
        // 今月皆勤の従業員を検索
        const employees = await prisma.user.findMany({
          where: { role: 'EMPLOYEE', isActive: true }
        })

        for (const employee of employees) {
          const attendanceCount = await prisma.attendance.count({
            where: {
              userId: employee.id,
              date: {
                gte: monthStart,
                lt: monthEnd
              },
              clockInTime: { not: null }
            }
          })

          const workingDaysInMonth = await getWorkingDaysInMonth(monthStart)
          
          if (attendanceCount >= workingDaysInMonth && attendanceCount >= perfectAttendanceBadge.threshold) {
            // 既にバッジを持っていないかチェック
            const existingBadge = await prisma.userBadge.findUnique({
              where: {
                userId_badgeId: {
                  userId: employee.id,
                  badgeId: perfectAttendanceBadge.id
                }
              }
            })

            if (!existingBadge) {
              await prisma.userBadge.create({
                data: {
                  userId: employee.id,
                  badgeId: perfectAttendanceBadge.id
                }
              })

              // バッジ獲得通知
              await prisma.notification.create({
                data: {
                  userId: employee.id,
                  companyId: employee.companyId,
                  type: 'SYSTEM',
                  title: 'バッジ獲得！',
                  content: `「${perfectAttendanceBadge.name}」バッジを獲得しました！`,
                }
              })
            }
          }
        }
      }

      console.log('🏆 Badge calculation completed')
    } catch (error) {
      console.error('Badge calculation job failed:', error)
    }
  })

  // 古い通知を削除（毎日午前2時）
  cron.schedule('0 2 * * *', async () => {
    try {
      console.log('🗑️ Running notification cleanup job...')
      
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const deletedCount = await prisma.notification.deleteMany({
        where: {
          createdAt: { lt: thirtyDaysAgo },
          isRead: true
        }
      })

      console.log(`🗑️ Deleted ${deletedCount.count} old notifications`)
    } catch (error) {
      console.error('Notification cleanup job failed:', error)
    }
  })

  console.log('✅ All cron jobs initialized')
}

// 月の営業日数を計算（土日を除外）
async function getWorkingDaysInMonth(monthStart: Date): Promise<number> {
  let workingDays = 0
  const date = new Date(monthStart)
  
  while (date.getMonth() === monthStart.getMonth()) {
    const dayOfWeek = date.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 日曜日(0)と土曜日(6)を除外
      workingDays++
    }
    date.setDate(date.getDate() + 1)
  }
  
  return workingDays
}