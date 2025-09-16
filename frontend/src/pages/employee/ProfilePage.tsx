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
  Avatar,
  SimpleGrid,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress,
  Divider,
} from '@chakra-ui/react'
import { FiSave, FiUser, FiBell, FiLock, FiEdit2, FiCalendar, FiClock } from 'react-icons/fi'
import { useAuthStore } from '../../store/authStore'

const ProfilePage = () => {
  const { user } = useAuthStore()
  const toast = useToast()
  
  // プロフィール設定
  const [profileSettings, setProfileSettings] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '090-1234-5678',
    address: '東京都港区赤坂1-1-1 マンション名 101号室',
    emergencyContact: '090-9876-5432',
    emergencyName: '田中花子（配偶者）',
    bio: '',
    skills: 'フォークリフト運転、大型免許、危険物取扱'
  })

  // 通知設定
  const [notificationSettings, setNotificationSettings] = useState({
    shiftReminders: true,
    reportDeadlines: true,
    systemUpdates: false,
    chatMessages: true,
    emailNotifications: true
  })

  // ダミー統計データ
  const employeeStats = {
    totalWorkDays: 24,
    totalHours: 192,
    totalEarnings: 580000,
    averageRating: 4.8,
    completionRate: 98.5,
    thisMonth: {
      workDays: 20,
      hours: 160,
      earnings: 480000
    }
  }

  const handleSaveProfile = () => {
    toast({
      title: 'プロフィールを保存しました',
      description: 'プロフィール情報が正常に更新されました',
      status: 'success',
      duration: 3000,
      isClosable: true
    })
  }

  const handleSaveNotifications = () => {
    toast({
      title: '通知設定を保存しました',
      description: '通知設定が正常に更新されました',
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
          <Heading size="lg">👤 プロフィール</Heading>
          <Text color="gray.600">個人情報と設定の管理</Text>
        </VStack>

        {/* 統計サマリー */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>今月の稼働日数</StatLabel>
                <StatNumber>{employeeStats.thisMonth.workDays}</StatNumber>
                <StatHelpText>
                  <Text as="span" color="green.500">
                    +2日
                  </Text>
                  {' '}先月比
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>今月の収入</StatLabel>
                <StatNumber>¥{employeeStats.thisMonth.earnings.toLocaleString()}</StatNumber>
                <StatHelpText>
                  <Text as="span" color="green.500">
                    +8.5%
                  </Text>
                  {' '}先月比
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>平均評価</StatLabel>
                <StatNumber>{employeeStats.averageRating}</StatNumber>
                <StatHelpText>5点満点中</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>完遂率</StatLabel>
                <StatNumber>{employeeStats.completionRate}%</StatNumber>
                <StatHelpText>
                  <Progress
                    value={employeeStats.completionRate}
                    colorScheme="green"
                    size="sm"
                    mt={1}
                  />
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          {/* プロフィール情報 */}
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack>
                  <FiUser />
                  <Heading size="md">基本情報</Heading>
                </HStack>
                
                <VStack spacing={4}>
                  <HStack spacing={4} w="full">
                    <Avatar size="lg" name={profileSettings.name} />
                    <VStack align="start" spacing={1} flex={1}>
                      <Text fontWeight="bold">{profileSettings.name}</Text>
                      <Badge colorScheme="secondary">従業員</Badge>
                      <Button size="xs" leftIcon={<FiEdit2 />} variant="ghost">
                        写真を変更
                      </Button>
                    </VStack>
                  </HStack>
                  
                  <FormControl>
                    <FormLabel>氏名</FormLabel>
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
                    <FormLabel>住所</FormLabel>
                    <Textarea
                      value={profileSettings.address}
                      onChange={(e) => setProfileSettings({
                        ...profileSettings,
                        address: e.target.value
                      })}
                    />
                  </FormControl>
                  
                  <Divider />
                  
                  <FormControl>
                    <FormLabel>緊急連絡先（氏名）</FormLabel>
                    <Input
                      value={profileSettings.emergencyName}
                      onChange={(e) => setProfileSettings({
                        ...profileSettings,
                        emergencyName: e.target.value
                      })}
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>緊急連絡先（電話番号）</FormLabel>
                    <Input
                      value={profileSettings.emergencyContact}
                      onChange={(e) => setProfileSettings({
                        ...profileSettings,
                        emergencyContact: e.target.value
                      })}
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>保有スキル・資格</FormLabel>
                    <Textarea
                      value={profileSettings.skills}
                      onChange={(e) => setProfileSettings({
                        ...profileSettings,
                        skills: e.target.value
                      })}
                      placeholder="フォークリフト運転、大型免許など..."
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>自己PR</FormLabel>
                    <Textarea
                      value={profileSettings.bio}
                      onChange={(e) => setProfileSettings({
                        ...profileSettings,
                        bio: e.target.value
                      })}
                      placeholder="自己PRを入力してください..."
                    />
                  </FormControl>
                </VStack>
                
                <HStack spacing={3}>
                  <Button
                    leftIcon={<FiSave />}
                    colorScheme="primary"
                    onClick={handleSaveProfile}
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

          {/* 設定と統計 */}
          <VStack spacing={6} align="stretch">
            {/* 通知設定 */}
            <Card>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <HStack>
                    <FiBell />
                    <Heading size="md">通知設定</Heading>
                  </HStack>
                  
                  <VStack spacing={3} align="stretch">
                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="shift-reminders" mb="0" flex={1}>
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
                      <FormLabel htmlFor="report-deadlines" mb="0" flex={1}>
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
                      <FormLabel htmlFor="chat-messages" mb="0" flex={1}>
                        チャットメッセージ
                      </FormLabel>
                      <Switch
                        id="chat-messages"
                        isChecked={notificationSettings.chatMessages}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          chatMessages: e.target.checked
                        })}
                      />
                    </FormControl>
                    
                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="email-notifications" mb="0" flex={1}>
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
                  </VStack>
                  
                  <Button
                    leftIcon={<FiSave />}
                    colorScheme="primary"
                    size="sm"
                    onClick={handleSaveNotifications}
                  >
                    保存
                  </Button>
                </VStack>
              </CardBody>
            </Card>

            {/* 今月の実績 */}
            <Card>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <HStack>
                    <FiCalendar />
                    <Heading size="md">今月の実績</Heading>
                  </HStack>
                  
                  <VStack spacing={3} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">稼働日数</Text>
                      <Text fontWeight="medium">{employeeStats.thisMonth.workDays}日</Text>
                    </HStack>
                    
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">労働時間</Text>
                      <Text fontWeight="medium">{employeeStats.thisMonth.hours}時間</Text>
                    </HStack>
                    
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">収入</Text>
                      <Text fontWeight="medium" color="green.500">
                        ¥{employeeStats.thisMonth.earnings.toLocaleString()}
                      </Text>
                    </HStack>
                    
                    <Divider />
                    
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">時給平均</Text>
                      <Text fontWeight="medium">
                        ¥{Math.round(employeeStats.thisMonth.earnings / employeeStats.thisMonth.hours).toLocaleString()}
                      </Text>
                    </HStack>
                  </VStack>
                </VStack>
              </CardBody>
            </Card>

            {/* 全期間統計 */}
            <Card>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <HStack>
                    <FiClock />
                    <Heading size="md">累計実績</Heading>
                  </HStack>
                  
                  <VStack spacing={3} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">総稼働日数</Text>
                      <Text fontWeight="medium">{employeeStats.totalWorkDays}日</Text>
                    </HStack>
                    
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">総労働時間</Text>
                      <Text fontWeight="medium">{employeeStats.totalHours}時間</Text>
                    </HStack>
                    
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">総収入</Text>
                      <Text fontWeight="medium" color="green.500">
                        ¥{employeeStats.totalEarnings.toLocaleString()}
                      </Text>
                    </HStack>
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </SimpleGrid>
      </VStack>
    </Box>
  )
}

export default ProfilePage