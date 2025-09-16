import bcrypt from 'bcryptjs'
import prisma from '../services/database.js'

async function main() {
  console.log('🌱 データベースのシードを開始...')

  // 既存データの削除
  await prisma.userBadge.deleteMany()
  await prisma.badge.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.message.deleteMany()
  await prisma.chatParticipant.deleteMany()
  await prisma.chat.deleteMany()
  await prisma.attendance.deleteMany()
  await prisma.dailyReport.deleteMany()
  await prisma.shiftAssignment.deleteMany()
  await prisma.shiftSlot.deleteMany()
  await prisma.shift.deleteMany()
  await prisma.shiftRequest.deleteMany()
  await prisma.location.deleteMany()
  await prisma.session.deleteMany()
  await prisma.tempToken.deleteMany()
  await prisma.otp.deleteMany()
  await prisma.user.deleteMany()
  await prisma.company.deleteMany()

  // パスワードハッシュ化
  const passwordHash = await bcrypt.hash('password123', 12)

  // デモ会社作成
  const company = await prisma.company.create({
    data: {
      id: 'demo-company-1',
      name: '軽貨物運送デモ株式会社',
      adminId: 'temp',
      shiftDeadlineDay: 15,
      workingHoursStart: '09:00',
      workingHoursEnd: '18:00',
      overtimeRate: 1.25,
    }
  })

  // 管理者ユーザー作成
  const admin = await prisma.user.create({
    data: {
      id: 'admin-1',
      email: 'admin@shift-match.com',
      password: passwordHash,
      name: '田中 太郎（管理者）',
      role: 'ADMIN',
      companyId: company.id,
      avatar: null,
      phone: '090-1234-5678',
    }
  })

  // 会社の管理者IDを更新
  await prisma.company.update({
    where: { id: company.id },
    data: { adminId: admin.id }
  })

  // 従業員ユーザー作成
  const employees = await Promise.all([
    prisma.user.create({
      data: {
        id: 'employee-1',
        email: 'employee1@shift-match.com',
        password: passwordHash,
        name: '佐藤 花子',
        role: 'EMPLOYEE',
        companyId: company.id,
        phone: '090-2345-6789',
      }
    }),
    prisma.user.create({
      data: {
        id: 'employee-2',
        email: 'employee2@shift-match.com',
        password: passwordHash,
        name: '鈴木 一郎',
        role: 'EMPLOYEE',
        companyId: company.id,
        phone: '090-3456-7890',
      }
    }),
    prisma.user.create({
      data: {
        id: 'employee-3',
        email: 'employee3@shift-match.com',
        password: passwordHash,
        name: '高橋 美咲',
        role: 'EMPLOYEE',
        companyId: company.id,
        phone: '090-4567-8901',
      }
    }),
    prisma.user.create({
      data: {
        id: 'employee-4',
        email: 'employee4@shift-match.com',
        password: passwordHash,
        name: '山田 健太',
        role: 'EMPLOYEE',
        companyId: company.id,
        phone: '090-5678-9012',
      }
    }),
    prisma.user.create({
      data: {
        id: 'employee-5',
        email: 'employee5@shift-match.com',
        password: passwordHash,
        name: '伊藤 愛',
        role: 'EMPLOYEE',
        companyId: company.id,
        phone: '090-6789-0123',
      }
    })
  ])

  // 営業所・勤務地作成
  const locations = await Promise.all([
    prisma.location.create({
      data: {
        id: 'location-1',
        companyId: company.id,
        name: '東京営業所',
        address: '東京都渋谷区渋谷1-1-1',
        latitude: 35.6596,
        longitude: 139.7006,
      }
    }),
    prisma.location.create({
      data: {
        id: 'location-2',
        companyId: company.id,
        name: '新宿営業所',
        address: '東京都新宿区新宿3-3-3',
        latitude: 35.6906,
        longitude: 139.7006,
      }
    }),
    prisma.location.create({
      data: {
        id: 'location-3',
        companyId: company.id,
        name: '池袋営業所',
        address: '東京都豊島区南池袋1-1-1',
        latitude: 35.7295,
        longitude: 139.7109,
      }
    })
  ])

  // 今月のシフト作成
  const currentDate = new Date()
  const currentMonth = currentDate.toISOString().substring(0, 7) // YYYY-MM

  const shift = await prisma.shift.create({
    data: {
      id: 'shift-1',
      companyId: company.id,
      month: currentMonth,
      status: 'PUBLISHED',
      publishedAt: new Date(),
    }
  })

  // シフトスロット作成（今月の平日分）
  const shiftSlots = []
  for (let day = 1; day <= 30; day++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    if (date.getDay() === 0 || date.getDay() === 6) continue // 土日除外

    for (const location of locations) {
      const slot = await prisma.shiftSlot.create({
        data: {
          shiftId: shift.id,
          locationId: location.id,
          date: date,
          requiredCount: Math.floor(Math.random() * 3) + 2, // 2-4人
          isPublic: Math.random() > 0.7, // 30%の確率で人員不足公開
        }
      })
      shiftSlots.push(slot)
    }
  }

  // シフト割り当て（ランダムに従業員を配置）
  for (const slot of shiftSlots) {
    const assignCount = Math.min(slot.requiredCount, Math.floor(Math.random() * slot.requiredCount) + 1)
    const shuffledEmployees = employees.sort(() => Math.random() - 0.5)
    
    for (let i = 0; i < assignCount; i++) {
      if (shuffledEmployees[i]) {
        await prisma.shiftAssignment.create({
          data: {
            slotId: slot.id,
            userId: shuffledEmployees[i].id,
            isConfirmed: Math.random() > 0.2, // 80%の確率で確定
          }
        })
      }
    }
  }

  // シフト希望提出データ
  const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
  const nextMonthStr = nextMonth.toISOString().substring(0, 7)

  for (const employee of employees) {
    // 来月の日付データを生成
    const dates: Record<string, string> = {}
    const daysInMonth = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate()
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${nextMonthStr}-${String(day).padStart(2, '0')}`
      const rand = Math.random()
      if (rand > 0.8) dates[dateStr] = 'UNAVAILABLE'
      else if (rand > 0.1) dates[dateStr] = 'AVAILABLE'
      else dates[dateStr] = 'UNDECIDED'
    }

    await prisma.shiftRequest.create({
      data: {
        userId: employee.id,
        companyId: company.id,
        month: nextMonthStr,
        dates: JSON.stringify(dates),
        comment: `${employee.name}からのシフト希望です。`,
        submittedAt: new Date(),
      }
    })
  }

  // 日報データ作成（過去30日分）
  for (const employee of employees) {
    for (let i = 0; i < 20; i++) { // 20日分のランダムデータ
      const reportDate = new Date()
      reportDate.setDate(reportDate.getDate() - Math.floor(Math.random() * 30))
      
      const location = locations[Math.floor(Math.random() * locations.length)]
      const paymentType = Math.random() > 0.5 ? 'PIECE_RATE' : 'DAILY_RATE'
      
      let pieceRateItems, totalAmount, dailyAmount
      
      if (paymentType === 'PIECE_RATE') {
        const items = [
          { name: '配送', unitPrice: 150, quantity: Math.floor(Math.random() * 20) + 10 },
          { name: 'ピッキング', unitPrice: 100, quantity: Math.floor(Math.random() * 15) + 5 },
        ]
        totalAmount = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)
        pieceRateItems = JSON.stringify(items)
      } else {
        dailyAmount = Math.floor(Math.random() * 5000) + 8000 // 8000-13000円
      }

      await prisma.dailyReport.create({
        data: {
          userId: employee.id,
          companyId: company.id,
          locationId: location.id,
          date: reportDate,
          paymentType,
          pieceRateItems,
          totalAmount,
          dailyAmount,
          photos: JSON.stringify([]),
          notes: '順調に業務完了',
          submittedAt: reportDate,
        }
      })
    }
  }

  // 勤怠データ作成
  for (const employee of employees) {
    for (let i = 0; i < 15; i++) { // 15日分
      const attendanceDate = new Date()
      attendanceDate.setDate(attendanceDate.getDate() - i)
      
      if (attendanceDate.getDay() === 0 || attendanceDate.getDay() === 6) continue

      const location = locations[Math.floor(Math.random() * locations.length)]
      const clockInTime = new Date(attendanceDate)
      clockInTime.setHours(9, Math.floor(Math.random() * 30), 0, 0)
      
      const clockOutTime = new Date(clockInTime)
      clockOutTime.setHours(18, Math.floor(Math.random() * 60), 0, 0)
      
      const workingMinutes = Math.floor((clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60))

      await prisma.attendance.create({
        data: {
          userId: employee.id,
          companyId: company.id,
          locationId: location.id,
          date: attendanceDate,
          clockInTime,
          clockInLatitude: location.latitude + (Math.random() - 0.5) * 0.001,
          clockInLongitude: location.longitude + (Math.random() - 0.5) * 0.001,
          clockInAddress: location.address,
          clockOutTime,
          clockOutLatitude: location.latitude + (Math.random() - 0.5) * 0.001,
          clockOutLongitude: location.longitude + (Math.random() - 0.5) * 0.001,
          clockOutAddress: location.address,
          workingMinutes,
          overtimeMinutes: Math.max(0, workingMinutes - 480), // 8時間超過分
        }
      })
    }
  }

  // バッジ作成
  const badges = await Promise.all([
    prisma.badge.create({
      data: {
        name: '皆勤賞',
        description: '月間無欠勤で獲得',
        icon: '🏆',
        type: 'PERFECT_ATTENDANCE',
        threshold: 20,
        period: 'MONTHLY',
      }
    }),
    prisma.badge.create({
      data: {
        name: 'TOP売上',
        description: '月間売上1位で獲得',
        icon: '⭐',
        type: 'TOP_PERFORMER',
        threshold: 1,
        period: 'MONTHLY',
      }
    }),
    prisma.badge.create({
      data: {
        name: '連続勤務',
        description: '7日連続勤務で獲得',
        icon: '🔥',
        type: 'ATTENDANCE_DAYS',
        threshold: 7,
        period: 'WEEKLY',
      }
    })
  ])

  // ユーザーバッジ割り当て（ランダム）
  for (const employee of employees) {
    if (Math.random() > 0.5) {
      await prisma.userBadge.create({
        data: {
          userId: employee.id,
          badgeId: badges[0].id,
        }
      })
    }
    if (Math.random() > 0.7) {
      await prisma.userBadge.create({
        data: {
          userId: employee.id,
          badgeId: badges[2].id,
        }
      })
    }
  }

  // グループチャット作成
  const groupChat = await prisma.chat.create({
    data: {
      companyId: company.id,
      type: 'GROUP',
      name: '全体連絡',
    }
  })

  // チャット参加者追加
  const allUsers = [admin, ...employees]
  for (const user of allUsers) {
    await prisma.chatParticipant.create({
      data: {
        chatId: groupChat.id,
        userId: user.id,
      }
    })
  }

  // サンプルメッセージ
  await prisma.message.create({
    data: {
      chatId: groupChat.id,
      senderId: admin.id,
      content: 'お疲れ様です。来月のシフト希望提出をお忘れなく！',
      type: 'TEXT',
      readBy: JSON.stringify([admin.id]),
    }
  })

  await prisma.message.create({
    data: {
      chatId: groupChat.id,
      senderId: employees[0].id,
      content: '承知いたしました！',
      type: 'TEXT',
      readBy: JSON.stringify([employees[0].id]),
    }
  })

  // 通知データ
  for (const employee of employees) {
    await prisma.notification.create({
      data: {
        userId: employee.id,
        companyId: company.id,
        type: 'SHIFT_PUBLISHED',
        title: 'シフト公開のお知らせ',
        content: `${currentMonth}月のシフトが公開されました。ご確認ください。`,
        data: JSON.stringify({ shiftId: shift.id }),
      }
    })
  }

  console.log('✅ シードデータの作成が完了しました！')
  console.log('')
  console.log('📊 作成されたデータ:')
  console.log(`- 会社: 1社 (${company.name})`)
  console.log(`- 管理者: 1名 (${admin.email})`)
  console.log(`- 従業員: ${employees.length}名`)
  console.log(`- 営業所: ${locations.length}箇所`)
  console.log(`- シフトスロット: ${shiftSlots.length}件`)
  console.log(`- バッジ: ${badges.length}種類`)
  console.log('')
  console.log('🔑 ログイン情報:')
  console.log('管理者: admin@shift-match.com / password123')
  console.log('従業員: employee1@shift-match.com / password123')
  console.log('       employee2@shift-match.com / password123')
  console.log('       employee3@shift-match.com / password123')
  console.log('       employee4@shift-match.com / password123')
  console.log('       employee5@shift-match.com / password123')
}

main()
  .catch((e) => {
    console.error('❌ シードエラー:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })