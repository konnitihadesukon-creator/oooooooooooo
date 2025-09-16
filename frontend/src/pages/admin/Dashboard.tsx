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
  SimpleGrid,
  Progress,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Avatar,
  Badge,
} from '@chakra-ui/react'
import { FiUsers, FiCalendar, FiFileText, FiTrendingUp } from 'react-icons/fi'
import { useAuthStore } from '../../store/authStore'

// ダミーデータ
const adminDashboardData = {
  totalEmployees: 25,
  activeEmployees: 23,
  totalSales: 3625000,
  shiftFulfillmentRate: 92,
  locationStats: [
    { name: '東京営業所', fulfillmentRate: 95, totalSales: 1200000 },
    { name: '大阪営業所', fulfillmentRate: 88, totalSales: 980000 },
    { name: '名古屋営業所', fulfillmentRate: 94, totalSales: 1445000 },
  ],
  employeeRanking: [
    { name: '田中太郎', sales: 185000, workingDays: 24 },
    { name: '佐藤花子', sales: 172000, workingDays: 23 },
    { name: '鈴木一郎', sales: 168000, workingDays: 25 },
    { name: '高橋美咲', sales: 155000, workingDays: 22 },
    { name: '山田健太', sales: 145000, workingDays: 22 },
  ],
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuthStore()

  return (
    <Box>
      {/* ヘッダー */}
      <VStack align="start" spacing={4} mb={8}>
        <Heading size="lg">管理者ダッシュボード</Heading>
        <Text color="gray.600">
          全体の状況と従業員のパフォーマンスを確認できます
        </Text>
      </VStack>

      <Grid gap={6}>
        {/* 統計カード */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={6}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>総従業員数</StatLabel>
                <StatNumber>{adminDashboardData.totalEmployees}人</StatNumber>
                <StatHelpText>
                  <Text as="span" color="secondary.500">
                    {adminDashboardData.activeEmployees}人
                  </Text>
                  が稼働中
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>今月の総売上</StatLabel>
                <StatNumber>
                  ¥{adminDashboardData.totalSales.toLocaleString()}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  先月より 12.5%増
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>シフト充足率</StatLabel>
                <StatNumber>{adminDashboardData.shiftFulfillmentRate}%</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  目標達成中
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>平均売上/人</StatLabel>
                <StatNumber>
                  ¥{Math.round(adminDashboardData.totalSales / adminDashboardData.totalEmployees).toLocaleString()}
                </StatNumber>
                <StatHelpText>今月実績</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* メインコンテンツエリア */}
        <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6}>
          {/* 左側：営業所別統計 */}
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading size="md">営業所別パフォーマンス</Heading>
                <VStack spacing={4}>
                  {adminDashboardData.locationStats.map((location, index) => (
                    <Box key={index} w="full" p={4} borderRadius="lg" bg="gray.50">
                      <VStack spacing={3} align="stretch">
                        <HStack justify="space-between">
                          <Text fontWeight="bold">{location.name}</Text>
                          <Badge
                            colorScheme={location.fulfillmentRate >= 90 ? 'secondary' : 'yellow'}
                            variant="solid"
                          >
                            {location.fulfillmentRate}%
                          </Badge>
                        </HStack>
                        
                        <Box>
                          <HStack justify="space-between" mb={1}>
                            <Text fontSize="sm">充足率</Text>
                            <Text fontSize="sm">{location.fulfillmentRate}%</Text>
                          </HStack>
                          <Progress
                            value={location.fulfillmentRate}
                            colorScheme={location.fulfillmentRate >= 90 ? 'secondary' : 'yellow'}
                            bg="gray.200"
                            borderRadius="full"
                          />
                        </Box>
                        
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">売上</Text>
                          <Text fontSize="sm" fontWeight="medium">
                            ¥{location.totalSales.toLocaleString()}
                          </Text>
                        </HStack>
                      </VStack>
                    </Box>
                  ))}
                </VStack>
              </VStack>
            </CardBody>
          </Card>

          {/* 右側：従業員ランキング */}
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading size="md">従業員売上ランキング TOP5</Heading>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>順位</Th>
                      <Th>従業員名</Th>
                      <Th>売上</Th>
                      <Th>稼働日数</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {adminDashboardData.employeeRanking.map((employee, index) => (
                      <Tr key={index}>
                        <Td>
                          <HStack>
                            <Text fontWeight="bold" color="primary.500">
                              {index + 1}
                            </Text>
                            {index === 0 && <Text>🏆</Text>}
                            {index === 1 && <Text>🥈</Text>}
                            {index === 2 && <Text>🥉</Text>}
                          </HStack>
                        </Td>
                        <Td>
                          <HStack>
                            <Avatar size="sm" name={employee.name} />
                            <Text fontSize="sm">{employee.name}</Text>
                          </HStack>
                        </Td>
                        <Td>
                          <Text fontSize="sm" fontWeight="medium">
                            ¥{employee.sales.toLocaleString()}
                          </Text>
                        </Td>
                        <Td>
                          <Text fontSize="sm">{employee.workingDays}日</Text>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </VStack>
            </CardBody>
          </Card>
        </Grid>

        {/* アラート・通知エリア */}
        <Card bg="accent.50" borderColor="accent.200" borderWidth="1px">
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack>
                <Box fontSize="2xl">⚠️</Box>
                <Heading size="md" color="accent.700">
                  要注意事項
                </Heading>
              </HStack>
              <VStack spacing={2} align="stretch">
                <HStack>
                  <Box w={2} h={2} borderRadius="full" bg="red.500" />
                  <Text fontSize="sm">
                    東京営業所で明日のシフトに2名の不足が発生しています
                  </Text>
                </HStack>
                <HStack>
                  <Box w={2} h={2} borderRadius="full" bg="yellow.500" />
                  <Text fontSize="sm">
                    5名の従業員が日報の提出が遅れています
                  </Text>
                </HStack>
                <HStack>
                  <Box w={2} h={2} borderRadius="full" bg="blue.500" />
                  <Text fontSize="sm">
                    来月のシフト希望提出期限が3日後です
                  </Text>
                </HStack>
              </VStack>
            </VStack>
          </CardBody>
        </Card>
      </Grid>
    </Box>
  )
}

export default AdminDashboard