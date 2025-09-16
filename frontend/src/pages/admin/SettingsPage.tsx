import React, { useState } from 'react'
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Switch,
  Select,
  useToast,
  Divider,
  Avatar,
  SimpleGrid,
  Badge,
  IconButton,
  Tooltip,
} from '@chakra-ui/react'
import { FiSave, FiUser, FiBell, FiLock, FiGlobe, FiEdit2 } from 'react-icons/fi'
import { useAuthStore } from '../../store/authStore'

const SettingsPage = () => {
  const { user } = useAuthStore()
  const toast = useToast()
  
  // 会社設定
  const [companySettings, setCompanySettings] = useState({
    name: `${user?.name}の会社`,
    description: '軽貨物運送業を営む会社です',
    email: 'info@company.com',
    phone: '03-1234-5678',
    address: '東京都港区赤坂1-1-1',
    website: 'https://company.com'
  })

  // 通知設定
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    shiftReminders: true,
    reportDeadlines: true,
    systemUpdates: false,
    marketingEmails: false
  })

  // システム設定
  const [systemSettings, setSystemSettings] = useState({
    timezone: 'Asia/Tokyo',
    dateFormat: 'YYYY/MM/DD',
    currency: 'JPY',
    language: 'ja',
    autoLogout: '8',
    reportDeadline: '18:00'
  })

  // プロフィール設定
  const [profileSettings, setProfileSettings] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '090-1234-5678',
    position: '代表取締役',
    bio: ''
  })

  const handleSaveCompanySettings = () => {
    toast({
      title: '会社設定を保存しました',
      description: '会社情報が正常に更新されました',
      status: 'success',
      duration: 3000,
      isClosable: true
    })
  }

  const handleSaveNotificationSettings = () => {
    toast({
      title: '通知設定を保存しました',
      description: '通知設定が正常に更新されました',
      status: 'success',
      duration: 3000,
      isClosable: true
    })
  }

  const handleSaveSystemSettings = () => {
    toast({
      title: 'システム設定を保存しました',
      description: 'システム設定が正常に更新されました',
      status: 'success',
      duration: 3000,
      isClosable: true
    })
  }

  const handleSaveProfileSettings = () => {
    toast({
      title: 'プロフィールを保存しました',
      description: 'プロフィール情報が正常に更新されました',
      status: 'success',
      duration: 3000,
      isClosable: true
    })
  }

  const handleChangePassword = () => {
    toast({
      title: 'パスワード変更',
      description: 'パスワード変更機能は開発中です',
      status: 'info',
      duration: 3000,
      isClosable: true
    })
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* ヘッダー */}
        <VStack align="start" spacing={1}>
          <Heading size="lg">⚙️ 設定</Heading>
          <Text color="gray.600">システム設定とプロフィール管理</Text>
        </VStack>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          {/* プロフィール設定 */}
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <HStack>
                    <FiUser />
                    <Heading size="md">プロフィール設定</Heading>
                  </HStack>
                </HStack>
                
                <VStack spacing={4}>
                  <HStack spacing={4} w="full">
                    <Avatar size="lg" name={profileSettings.name} />
                    <VStack align="start" spacing={1} flex={1}>
                      <Text fontWeight="bold">{profileSettings.name}</Text>
                      <Badge colorScheme="primary">{user?.role === 'ADMIN' ? '管理者' : '従業員'}</Badge>
                      <Button size="xs" leftIcon={<FiEdit2 />} variant="ghost">
                        写真を変更
                      </Button>
                    </VStack>
                  </HStack>
                  
                  <FormControl>
                    <FormLabel>名前</FormLabel>
                    <Input
                      value={profileSettings.name}
                      onChange={(e) => setProfileSettings({
                        ...profileSettings,
                        name: e.target.value
                      })}
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>メールアドレス</FormLabel>
                    <Input
                      type="email"
                      value={profileSettings.email}
                      onChange={(e) => setProfileSettings({
                        ...profileSettings,
                        email: e.target.value
                      })}
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>電話番号</FormLabel>
                    <Input
                      value={profileSettings.phone}
                      onChange={(e) => setProfileSettings({
                        ...profileSettings,
                        phone: e.target.value
                      })}
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>役職</FormLabel>
                    <Input
                      value={profileSettings.position}
                      onChange={(e) => setProfileSettings({
                        ...profileSettings,
                        position: e.target.value
                      })}
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>自己紹介</FormLabel>
                    <Textarea
                      value={profileSettings.bio}
                      onChange={(e) => setProfileSettings({
                        ...profileSettings,
                        bio: e.target.value
                      })}
                      placeholder="自己紹介を入力してください..."
                    />
                  </FormControl>
                </VStack>
                
                <HStack spacing={3}>
                  <Button
                    leftIcon={<FiSave />}
                    colorScheme="primary"
                    onClick={handleSaveProfileSettings}
                  >
                    保存
                  </Button>
                  <Button
                    leftIcon={<FiLock />}
                    variant="outline"
                    onClick={handleChangePassword}
                  >
                    パスワード変更
                  </Button>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {/* 通知設定 */}
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack>
                  <FiBell />
                  <Heading size="md">通知設定</Heading>
                </HStack>
                
                <VStack spacing={4} align="stretch">
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="email-notifications" mb="0">
                      メール通知
                    </FormLabel>
                    <Switch
                      id="email-notifications"
                      isChecked={notificationSettings.emailNotifications}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        emailNotifications: e.target.checked
                      })}
                    />
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="shift-reminders" mb="0">
                      シフトリマインダー
                    </FormLabel>
                    <Switch
                      id="shift-reminders"
                      isChecked={notificationSettings.shiftReminders}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        shiftReminders: e.target.checked
                      })}
                    />
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="report-deadlines" mb="0">
                      日報提出期限通知
                    </FormLabel>
                    <Switch
                      id="report-deadlines"
                      isChecked={notificationSettings.reportDeadlines}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        reportDeadlines: e.target.checked
                      })}
                    />
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="system-updates" mb="0">
                      システム更新通知
                    </FormLabel>
                    <Switch
                      id="system-updates"
                      isChecked={notificationSettings.systemUpdates}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        systemUpdates: e.target.checked
                      })}
                    />
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="marketing-emails" mb="0">
                      マーケティングメール
                    </FormLabel>
                    <Switch
                      id="marketing-emails"
                      isChecked={notificationSettings.marketingEmails}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        marketingEmails: e.target.checked
                      })}
                    />
                  </FormControl>
                </VStack>
                
                <Button
                  leftIcon={<FiSave />}
                  colorScheme="primary"
                  onClick={handleSaveNotificationSettings}
                >
                  保存
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          {/* 会社設定 */}
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack>
                  <FiGlobe />
                  <Heading size="md">会社設定</Heading>
                </HStack>
                
                <VStack spacing={4}>
                  <FormControl>
                    <FormLabel>会社名</FormLabel>
                    <Input
                      value={companySettings.name}
                      onChange={(e) => setCompanySettings({
                        ...companySettings,
                        name: e.target.value
                      })}
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>会社説明</FormLabel>
                    <Textarea
                      value={companySettings.description}
                      onChange={(e) => setCompanySettings({
                        ...companySettings,
                        description: e.target.value
                      })}
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>メールアドレス</FormLabel>
                    <Input
                      type="email"
                      value={companySettings.email}
                      onChange={(e) => setCompanySettings({
                        ...companySettings,
                        email: e.target.value
                      })}
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>電話番号</FormLabel>
                    <Input
                      value={companySettings.phone}
                      onChange={(e) => setCompanySettings({
                        ...companySettings,
                        phone: e.target.value
                      })}
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>住所</FormLabel>
                    <Textarea
                      value={companySettings.address}
                      onChange={(e) => setCompanySettings({
                        ...companySettings,
                        address: e.target.value
                      })}
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>ウェブサイト</FormLabel>
                    <Input
                      value={companySettings.website}
                      onChange={(e) => setCompanySettings({
                        ...companySettings,
                        website: e.target.value
                      })}
                    />
                  </FormControl>
                </VStack>
                
                <Button
                  leftIcon={<FiSave />}
                  colorScheme="primary"
                  onClick={handleSaveCompanySettings}
                >
                  保存
                </Button>
              </VStack>
            </CardBody>
          </Card>

          {/* システム設定 */}
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack>
                  <Text fontSize="xl">🔧</Text>
                  <Heading size="md">システム設定</Heading>
                </HStack>
                
                <VStack spacing={4}>
                  <FormControl>
                    <FormLabel>タイムゾーン</FormLabel>
                    <Select
                      value={systemSettings.timezone}
                      onChange={(e) => setSystemSettings({
                        ...systemSettings,
                        timezone: e.target.value
                      })}
                    >
                      <option value="Asia/Tokyo">日本標準時 (JST)</option>
                      <option value="UTC">協定世界時 (UTC)</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>日付フォーマット</FormLabel>
                    <Select
                      value={systemSettings.dateFormat}
                      onChange={(e) => setSystemSettings({
                        ...systemSettings,
                        dateFormat: e.target.value
                      })}
                    >
                      <option value="YYYY/MM/DD">2024/09/16</option>
                      <option value="DD/MM/YYYY">16/09/2024</option>
                      <option value="MM/DD/YYYY">09/16/2024</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>通貨</FormLabel>
                    <Select
                      value={systemSettings.currency}
                      onChange={(e) => setSystemSettings({
                        ...systemSettings,
                        currency: e.target.value
                      })}
                    >
                      <option value="JPY">日本円 (¥)</option>
                      <option value="USD">米ドル ($)</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>言語</FormLabel>
                    <Select
                      value={systemSettings.language}
                      onChange={(e) => setSystemSettings({
                        ...systemSettings,
                        language: e.target.value
                      })}
                    >
                      <option value="ja">日本語</option>
                      <option value="en">English</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>自動ログアウト時間（時間）</FormLabel>
                    <Select
                      value={systemSettings.autoLogout}
                      onChange={(e) => setSystemSettings({
                        ...systemSettings,
                        autoLogout: e.target.value
                      })}
                    >
                      <option value="1">1時間</option>
                      <option value="4">4時間</option>
                      <option value="8">8時間</option>
                      <option value="24">24時間</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>日報提出期限</FormLabel>
                    <Input
                      type="time"
                      value={systemSettings.reportDeadline}
                      onChange={(e) => setSystemSettings({
                        ...systemSettings,
                        reportDeadline: e.target.value
                      })}
                    />
                  </FormControl>
                </VStack>
                
                <Button
                  leftIcon={<FiSave />}
                  colorScheme="primary"
                  onClick={handleSaveSystemSettings}
                >
                  保存
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>
      </VStack>
    </Box>
  )
}

export default SettingsPage