import React from 'react'
import {
  Box,
  Grid,
  Heading,
  Text,
  Card,
  CardBody,
  VStack,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Avatar,
  Badge,
  Button,
  SimpleGrid,
  Progress,
} from '@chakra-ui/react'
import { 
  FiCalendar, 
  FiFileText, 
  FiClock, 
  FiDollarSign, 
  FiTrendingUp,
  FiAward 
} from 'react-icons/fi'
import { useAuthStore } from '../../store/authStore'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@shared/constants'

// ダミーデータ（実際の実装では API から取得）
const dashboardData = {
  workingDays: 22,
  totalSales: 145000,
  averageDaily: 6590,
  monthlyTrend: [
    { date: '2024-01', sales: 120000 },
    { date: '2024-02', sales: 135000 },
    { date: '2024-03', sales: 145000 },
  ],
  ranking: { position: 3, total: 25 },
  pendingTasks: {
    shiftRequest: 1,
    dailyReport: 2,
    unreadMessages: 5,
  },
  badges: [
    { name: '皆勤賞', icon: '🏆', earned: true },
    { name: 'TOP5入り', icon: '⭐', earned: true },
    { name: '連続勤務', icon: '🔥', earned: false },
  ],
}

const EmployeeDashboard: React.FC = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const quickActions = [
    {
      title: 'シフト希望提出',
      description: '来月のシフト希望を提出',
      icon: FiCalendar,
      color: 'primary',
      path: ROUTES.EMPLOYEE.SHIFT_REQUEST,
      urgent: dashboardData.pendingTasks.shiftRequest > 0,
    },
    {
      title: '日報提出',
      description: '今日の作業報告を提出',
      icon: FiFileText,
      color: 'secondary',
      path: ROUTES.EMPLOYEE.DAILY_REPORT,
      urgent: dashboardData.pendingTasks.dailyReport > 0,
    },
    {
      title: 'GPS勤怠',
      description: '出勤・退勤を記録',
      icon: FiClock,
      color: 'accent',
      path: ROUTES.EMPLOYEE.ATTENDANCE,
    },
  ]

  return (
    <Box>
      {/* ヘッダー */}
      <VStack align="start" spacing={4} mb={8}>
        <HStack spacing={4}>
          <Avatar
            size="lg"
            name={user?.name}
            src={user?.avatar}
            bg="primary.500"
          />
          <VStack align="start" spacing={1}>
            <Heading size="lg">おかえりなさい、{user?.name}さん</Heading>
            <Text color="gray.600">今日も一日お疲れ様です</Text>
          </VStack>
        </HStack>

        {/* シフトくんキャラクター */}
        <Card bg="primary.50" borderColor="primary.200" borderWidth="2px">
          <CardBody>
            <HStack spacing={4}>
              <Box fontSize="4xl">🚚</Box>
              <VStack align="start" spacing={1}>
                <Text fontWeight="bold" color="primary.700">
                  シフトくんより
                </Text>
                <Text fontSize="sm" color="primary.600">
                  今月の売上目標まであと¥{(150000 - dashboardData.totalSales).toLocaleString()}です！頑張りましょう！
                </Text>
              </VStack>
            </HStack>
          </CardBody>
        </Card>
      </VStack>

      <Grid gap={6}>
        {/* 統計カード */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={6}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>今月の稼働日数</StatLabel>
                <StatNumber>{dashboardData.workingDays}日</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  先月より 2日増
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>今月の売上</StatLabel>
                <StatNumber>¥{dashboardData.totalSales.toLocaleString()}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  先月より 7.4%増
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>日平均売上</StatLabel>
                <StatNumber>¥{dashboardData.averageDaily.toLocaleString()}</StatNumber>
                <StatHelpText>今月実績</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>チーム内順位</StatLabel>
                <StatNumber>
                  {dashboardData.ranking.position}位
                  <Text as="span" fontSize="md" color="gray.500">
                    /{dashboardData.ranking.total}人中
                  </Text>
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  前月より 2位上昇
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* メインコンテンツエリア */}
        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
          {/* 左側：クイックアクション */}
          <VStack spacing={6} align="stretch">
            <Card>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Heading size="md">クイックアクション</Heading>
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    {quickActions.map((action, index) => (
                      <Button
                        key={index}
                        size="lg"
                        height="auto"
                        p={6}
                        leftIcon={<action.icon />}
                        variant="outline"
                        colorScheme={action.color}
                        onClick={() => navigate(action.path)}
                        position="relative"
                      >
                        <VStack spacing={2}>
                          <Text fontWeight="bold">{action.title}</Text>
                          <Text fontSize="sm" opacity={0.8}>
                            {action.description}
                          </Text>
                        </VStack>
                        {action.urgent && (
                          <Badge
                            colorScheme="red"
                            position="absolute"
                            top="-1"
                            right="-1"
                            borderRadius="full"
                          >
                            !
                          </Badge>
                        )}
                      </Button>
                    ))}
                  </SimpleGrid>
                </VStack>
              </CardBody>
            </Card>

            {/* 月間進捗 */}
            <Card>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Heading size="md">今月の進捗</Heading>
                  <VStack spacing={3} align="stretch">
                    <Box>
                      <HStack justify="space-between" mb={2}>
                        <Text fontSize="sm" fontWeight="medium">売上目標</Text>
                        <Text fontSize="sm">¥145,000 / ¥150,000</Text>
                      </HStack>
                      <Progress 
                        value={(dashboardData.totalSales / 150000) * 100} 
                        colorScheme="primary" 
                        bg="gray.100"
                        borderRadius="full"
                      />
                    </Box>
                    <Box>
                      <HStack justify="space-between" mb={2}>
                        <Text fontSize="sm" fontWeight="medium">稼働日数</Text>
                        <Text fontSize="sm">{dashboardData.workingDays} / 25日</Text>
                      </HStack>
                      <Progress 
                        value={(dashboardData.workingDays / 25) * 100} 
                        colorScheme="secondary" 
                        bg="gray.100"
                        borderRadius="full"
                      />
                    </Box>
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          </VStack>

          {/* 右側：バッジ・お知らせ */}
          <VStack spacing={6} align="stretch">
            {/* 獲得バッジ */}
            <Card>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Heading size="md">獲得バッジ</Heading>
                  <VStack spacing={3}>
                    {dashboardData.badges.map((badge, index) => (
                      <HStack
                        key={index}
                        p={3}
                        borderRadius="lg"
                        bg={badge.earned ? 'secondary.50' : 'gray.50'}
                        w="full"
                        opacity={badge.earned ? 1 : 0.5}
                      >
                        <Text fontSize="2xl">{badge.icon}</Text>
                        <VStack align="start" spacing={0} flex={1}>
                          <Text fontWeight="bold" fontSize="sm">
                            {badge.name}
                          </Text>
                          <Text fontSize="xs" color="gray.600">
                            {badge.earned ? '獲得済み' : '未獲得'}
                          </Text>
                        </VStack>
                        {badge.earned && (
                          <Badge colorScheme="secondary" variant="solid">
                            獲得
                          </Badge>
                        )}
                      </HStack>
                    ))}
                  </VStack>
                </VStack>
              </CardBody>
            </Card>

            {/* 最近の活動 */}
            <Card>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Heading size="md">最近の活動</Heading>
                  <VStack spacing={3} align="stretch">
                    <HStack>
                      <Box w={2} h={2} borderRadius="full" bg="secondary.500" />
                      <Text fontSize="sm">日報を提出しました</Text>
                    </HStack>
                    <HStack>
                      <Box w={2} h={2} borderRadius="full" bg="primary.500" />
                      <Text fontSize="sm">シフト希望を提出しました</Text>
                    </HStack>
                    <HStack>
                      <Box w={2} h={2} borderRadius="full" bg="accent.500" />
                      <Text fontSize="sm">勤怠を記録しました</Text>
                    </HStack>
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </Grid>
      </Grid>
    </Box>
  )
}

export default EmployeeDashboard