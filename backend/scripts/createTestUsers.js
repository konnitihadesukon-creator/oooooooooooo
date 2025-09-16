import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const prisma = new PrismaClient()

async function createTestUsers() {
  try {
    console.log('🚀 テストユーザーの作成を開始します...')

    // 既存のテストデータをクリア
    console.log('🧹 既存のテストデータをクリア中...')
    await prisma.tempToken.deleteMany({})
    await prisma.user.deleteMany({})
    await prisma.company.deleteMany({})

    // 1. 管理者アカウントと企業を作成
    console.log('👔 管理者アカウントを作成中...')
    
    const hashedPasswordAdmin = await bcrypt.hash('Remon5252', 12)
    
    // 企業を作成
    const company = await prisma.company.create({
      data: {
        name: 'Otok合同会社',
        adminId: 'temp'
      }
    })
    
    // 管理者ユーザーを作成
    const adminUser = await prisma.user.create({
      data: {
        email: 'konnitihadesukon@yahoo.co.jp',
        password: hashedPasswordAdmin,
        name: '前田',
        role: 'ADMIN',
        companyId: company.id,
        isActive: true,
        biometricEnabled: false,
        notificationEmail: true,
        notificationPush: true,
        notificationSms: false
      }
    })

    // 企業の管理者IDを更新
    await prisma.company.update({
      where: { id: company.id },
      data: { adminId: adminUser.id }
    })

    console.log('✅ 管理者アカウント作成完了')
    console.log(`   📧 Email: ${adminUser.email}`)
    console.log(`   👤 名前: ${adminUser.name}`)
    console.log(`   🏢 企業: ${company.name}`)

    // 2. 従業員用の招待コードを生成
    console.log('🎫 招待コード生成中...')
    
    const inviteCode = crypto.randomBytes(4).toString('hex').toUpperCase()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7日後

    const invitation = await prisma.tempToken.create({
      data: {
        email: adminUser.email, // 作成者のメール
        token: inviteCode,
        type: 'INVITATION',
        expiresAt,
        used: false,
        metadata: JSON.stringify({
          companyId: company.id,
          createdBy: adminUser.id
        })
      }
    })

    console.log('✅ 招待コード生成完了')
    console.log(`   🎫 招待コード: ${inviteCode}`)
    console.log(`   ⏰ 有効期限: ${expiresAt.toLocaleString('ja-JP')}`)

    // 3. 従業員アカウントを作成
    console.log('👷 従業員アカウントを作成中...')
    
    const hashedPasswordEmployee = await bcrypt.hash('Remon5252', 12)
    
    const employeeUser = await prisma.user.create({
      data: {
        email: 'uete@yahoo.co.jp', // 異なるメールアドレスを使用
        password: hashedPasswordEmployee,
        name: '上手',
        role: 'EMPLOYEE',
        companyId: company.id,
        isActive: true,
        biometricEnabled: false,
        notificationEmail: true,
        notificationPush: true,
        notificationSms: false
      }
    })

    // 招待コードを使用済みに
    await prisma.tempToken.update({
      where: { id: invitation.id },
      data: { used: true }
    })

    console.log('✅ 従業員アカウント作成完了')
    console.log(`   📧 Email: ${employeeUser.email}`)
    console.log(`   👤 名前: ${employeeUser.name}`)
    console.log(`   🏢 企業: ${company.name}`)

    // 4. 追加の有効な招待コードを生成（テスト用）
    console.log('🎫 追加の招待コードを生成中...')
    
    const additionalCodes = []
    for (let i = 0; i < 3; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase()
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      
      await prisma.tempToken.create({
        data: {
          email: adminUser.email, // 作成者のメール
          token: code,
          type: 'INVITATION',
          expiresAt: expires,
          used: false,
          metadata: JSON.stringify({
            companyId: company.id,
            createdBy: adminUser.id
          })
        }
      })
      
      additionalCodes.push(code)
    }

    console.log('✅ 追加の招待コード生成完了')
    additionalCodes.forEach((code, index) => {
      console.log(`   🎫 招待コード${index + 1}: ${code}`)
    })

    console.log('\n🎉 テストユーザーの作成が完了しました！')
    console.log('\n📋 ログイン情報:')
    console.log('管理者アカウント:')
    console.log(`  📧 Email: konnitihadesukon@yahoo.co.jp`)
    console.log(`  🔑 Password: Remon5252`)
    console.log(`  👤 名前: 前田`)
    console.log(`  🏢 企業: Otok合同会社`)
    console.log('')
    console.log('従業員アカウント:')
    console.log(`  📧 Email: uete@yahoo.co.jp`)
    console.log(`  🔑 Password: Remon5252`)
    console.log(`  👤 名前: 上手`)
    console.log(`  🏢 企業: Otok合同会社`)
    console.log('')
    console.log('🔗 アプリケーションURL: https://3000-i2we0qeyckf0hril09soe-6532622b.e2b.dev')

  } catch (error) {
    console.error('❌ エラーが発生しました:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createTestUsers()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })