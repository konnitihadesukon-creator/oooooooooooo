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
  SimpleGrid,
  Select,
  useToast,
  Flex,
  Progress,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
} from '@chakra-ui/react'
import { FiDownload, FiTrendingUp, FiTrendingDown, FiUsers, FiDollarSign } from 'react-icons/fi'

// ダミーデータ
const analyticsData = {
  overview: {
    totalRevenue: 15680000,
    revenueGrowth: 12.5,
    totalEmployees: 25,
    employeeGrowth: 8.3,
    totalShifts: 1240,
    shiftGrowth: -2.1,
    avgProductivity: 94.2,
    productivityGrowth: 5.7
  },
  monthlyData: [
    { month: '4月', revenue: 1200000, hours: 1800, productivity: 92 },
    { month: '5月', revenue: 1350000, hours: 1950, productivity: 94 },
    { month: '6月', revenue: 1480000, hours: 2100, productivity: 96 },
    { month: '7月', revenue: 1620000, hours: 2250, productivity: 93 },
    { month: '8月', revenue: 1580000, hours: 2180, productivity: 95 },
    { month: '9月', revenue: 1680000, hours: 2300, productivity: 97 }
  ],
  locationPerformance: [
    { name: '東京営業所', revenue: 6800000, employees: 15, productivity: 96.5 },
    { name: '大阪営業所', revenue: 4920000, employees: 8, productivity: 94.2 },
    { name: '名古屋営業所', revenue: 3960000, employees: 7, productivity: 92.8 }
  ],
  topEmployees: [
    { name: '田中太郎', revenue: 580000, hours: 192, rating: 'S' },
    { name: '佐藤花子', revenue: 520000, hours: 186, rating: 'A' },
    { name: '鈴木一郎', revenue: 490000, hours: 180, rating: 'A' },
    { name: '高橋美咲', revenue: 460000, hours: 175, rating: 'B' },
    { name: '山田健太', revenue: 440000, hours: 172, rating: 'B' }
  ]
}

const AnalyticsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('6months')
  const toast = useToast()

  const handleExportReport = () => {
    toast({
      title: 'レポート出力',
      description: 'レポート出力機能は開発中です',
      status: 'info',
      duration: 3000,
      isClosable: true
    })
  }

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'S': return 'purple'
      case 'A': return 'green'
      case 'B': return 'blue'
      case 'C': return 'orange'
      default: return 'gray'
    }
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* ヘッダー */}
        <Flex justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Heading size="lg">📊 分析・レポート</Heading>
            <Text color="gray.600">業績分析と詳細レポート</Text>
          </VStack>
          <HStack spacing={3}>
            <Select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              width="200px"
            >
              <option value="1month">直近1ヶ月</option>
              <option value="3months">直近3ヶ月</option>
              <option value="6months">直近6ヶ月</option>
              <option value="1year">直近1年</option>
            </Select>
            <Button
              leftIcon={<FiDownload />}
              colorScheme="primary"
              onClick={handleExportReport}
            >
              レポート出力
            </Button>
          </HStack>
        </Flex>

        {/* 概要統計 */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>総売上</StatLabel>
                <StatNumber>¥{analyticsData.overview.totalRevenue.toLocaleString()}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {analyticsData.overview.revenueGrowth}% 前月比
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>従業員数</StatLabel>
                <StatNumber>{analyticsData.overview.totalEmployees}人</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {analyticsData.overview.employeeGrowth}% 前月比
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>総シフト数</StatLabel>
                <StatNumber>{analyticsData.overview.totalShifts}</StatNumber>
                <StatHelpText>
                  <StatArrow type="decrease" />
                  {Math.abs(analyticsData.overview.shiftGrowth)}% 前月比
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>平均生産性</StatLabel>
                <StatNumber>{analyticsData.overview.avgProductivity}%</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {analyticsData.overview.productivityGrowth}% 前月比
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* 月別パフォーマンス */}
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Heading size="md">月別パフォーマンス</Heading>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>月</Th>
                    <Th>売上</Th>
                    <Th>労働時間</Th>
                    <Th>生産性</Th>
                    <Th>時間あたり売上</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {analyticsData.monthlyData.map((month, index) => (
                    <Tr key={index}>
                      <Td fontWeight="medium">{month.month}</Td>
                      <Td>¥{month.revenue.toLocaleString()}</Td>
                      <Td>{month.hours}時間</Td>
                      <Td>
                        <HStack spacing={2}>
                          <Progress
                            value={month.productivity}
                            colorScheme="green"
                            size="sm"
                            width="60px"
                          />
                          <Text fontSize="sm">{month.productivity}%</Text>
                        </HStack>
                      </Td>
                      <Td fontWeight="medium" color="green.500">
                        ¥{Math.round(month.revenue / month.hours).toLocaleString()}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </VStack>
          </CardBody>
        </Card>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          {/* 営業所別パフォーマンス */}
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading size="md">営業所別パフォーマンス</Heading>
                <VStack spacing={3}>
                  {analyticsData.locationPerformance.map((location, index) => (
                    <Box key={index} w="full" p={4} bg="gray.50" borderRadius="md">
                      <VStack spacing={2} align="stretch">
                        <HStack justify="space-between">
                          <Text fontWeight="bold">{location.name}</Text>
                          <Badge colorScheme="blue">{location.employees}人</Badge>
                        </HStack>
                        
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">売上</Text>
                          <Text fontSize="sm" fontWeight="medium">
                            ¥{location.revenue.toLocaleString()}
                          </Text>
                        </HStack>
                        
                        <Box>
                          <HStack justify="space-between" mb={1}>
                            <Text fontSize="sm" color="gray.600">生産性</Text>
                            <Text fontSize="sm">{location.productivity}%</Text>
                          </HStack>
                          <Progress
                            value={location.productivity}
                            colorScheme={location.productivity >= 95 ? 'green' : 'blue'}
                            size="sm"
                          />
                        </Box>
                        
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">1人当たり売上</Text>
                          <Text fontSize="sm" fontWeight="medium" color="green.500">
                            ¥{Math.round(location.revenue / location.employees).toLocaleString()}
                          </Text>
                        </HStack>
                      </VStack>
                    </Box>
                  ))}
                </VStack>
              </VStack>
            </CardBody>
          </Card>

          {/* トップパフォーマー */}
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading size="md">トップパフォーマー</Heading>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>順位</Th>
                      <Th>従業員名</Th>
                      <Th>売上</Th>
                      <Th>時間</Th>
                      <Th>評価</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {analyticsData.topEmployees.map((employee, index) => (
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
                          <Text fontSize="sm" fontWeight="medium">{employee.name}</Text>
                        </Td>
                        <Td>
                          <Text fontSize="sm" color="green.500">
                            ¥{employee.revenue.toLocaleString()}
                          </Text>
                        </Td>
                        <Td>
                          <Text fontSize="sm">{employee.hours}h</Text>
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={getRatingColor(employee.rating)}
                            variant="solid"
                          >
                            {employee.rating}
                          </Badge>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* 改善提案 */}
        <Card bg="blue.50" borderColor="blue.200" borderWidth="1px">
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack>
                <Box fontSize="2xl">💡</Box>
                <Heading size="md" color="blue.700">
                  改善提案
                </Heading>
              </HStack>
              <VStack spacing={2} align="stretch">
                <HStack>
                  <Box w={2} h={2} borderRadius="full" bg="green.500" />
                  <Text fontSize="sm">
                    東京営業所の生産性が高く、他拠点のモデルケースとして活用可能です
                  </Text>
                </HStack>
                <HStack>
                  <Box w={2} h={2} borderRadius="full" bg="orange.500" />
                  <Text fontSize="sm">
                    名古屋営業所の生産性向上のため、研修プログラムの実施を検討してください
                  </Text>
                </HStack>
                <HStack>
                  <Box w={2} h={2} borderRadius="full" bg="blue.500" />
                  <Text fontSize="sm">
                    8月のシフト数減少を受け、繁忙期の人員配置を見直すことをお勧めします
                  </Text>
                </HStack>
              </VStack>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  )
}

export default AnalyticsPage