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
  Badge,
  useToast,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Avatar,
  IconButton,
  Tooltip,
  Alert,
  AlertIcon,
  Flex,
  Spacer,
  Progress,
} from '@chakra-ui/react'
import { 
  FiCalendar, 
  FiClock, 
  FiMapPin, 
  FiDownload, 
  FiRefreshCw,
  FiCheck,
  FiX,
  FiAlertCircle
} from 'react-icons/fi'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from 'date-fns'
import { ja } from 'date-fns/locale'

// ダミーデータ
const mockShifts = [
  {
    id: '1',
    date: '2024-09-18',
    startTime: '09:00',
    endTime: '18:00',
    location: '東京営業所',
    status: 'confirmed',
    type: 'regular',
    notes: ''
  },
  {
    id: '2',
    date: '2024-09-19',
    startTime: '08:00',
    endTime: '17:00',
    location: '大阪営業所',
    status: 'confirmed',
    type: 'regular',
    notes: '重要な配送があります'
  },
  {
    id: '3',
    date: '2024-09-20',
    startTime: '10:00',
    endTime: '19:00',
    location: '名古屋営業所',
    status: 'pending',
    type: 'overtime',
    notes: '残業予定'
  },
  {
    id: '4',
    date: '2024-09-21',
    startTime: '09:30',
    endTime: '18:30',
    location: '東京営業所',
    status: 'confirmed',
    type: 'regular',
    notes: ''
  },
  {
    id: '5',
    date: '2024-09-25',
    startTime: '08:30',
    endTime: '17:30',
    location: '東京営業所',
    status: 'rejected',
    type: 'regular',
    notes: '人員調整のため'
  }
]

const ShiftViewPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('calendar') // calendar or list
  const toast = useToast()

  const handlePreviousMonth = () => {
    setCurrentDate(prev => subMonths(prev, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleExportSchedule = () => {
    toast({
      title: 'スケジュール出力',
      description: 'スケジュール出力機能は開発中です',
      status: 'info',
      duration: 3000,
      isClosable: true
    })
  }

  const handleRefresh = () => {
    toast({
      title: 'シフト情報を更新',
      description: '最新のシフト情報を取得しました',
      status: 'success',
      duration: 2000,
      isClosable: true
    })
  }

  // 月の日付配列を取得
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // カレンダーグリッド用に前後の日付も含める
  const startDate = new Date(monthStart)
  startDate.setDate(startDate.getDate() - getDay(monthStart))
  
  const endDate = new Date(monthEnd)
  endDate.setDate(endDate.getDate() + (6 - getDay(monthEnd)))
  
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })

  // 日付からシフトを取得
  const getShiftForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return mockShifts.find(shift => shift.date === dateStr)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'green'
      case 'pending': return 'yellow'
      case 'rejected': return 'red'
      default: return 'gray'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return '確定'
      case 'pending': return '承認待ち'
      case 'rejected': return '却下'
      default: return '未定'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'regular': return 'blue'
      case 'overtime': return 'purple'
      case 'holiday': return 'orange'
      default: return 'gray'
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'regular': return '通常'
      case 'overtime': return '残業'
      case 'holiday': return '休日出勤'
      default: return '未分類'
    }
  }

  const confirmedShifts = mockShifts.filter(shift => shift.status === 'confirmed').length
  const pendingShifts = mockShifts.filter(shift => shift.status === 'pending').length
  const totalHours = mockShifts
    .filter(shift => shift.status === 'confirmed')
    .reduce((total, shift) => {
      const start = new Date(`2000-01-01T${shift.startTime}`)
      const end = new Date(`2000-01-01T${shift.endTime}`)
      return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    }, 0)

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* ヘッダー */}
        <Flex justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Heading size="lg">📅 シフト確認</Heading>
            <Text color="gray.600">承認されたシフトと申請状況</Text>
          </VStack>
          <HStack spacing={3}>
            <Select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              width="150px"
            >
              <option value="calendar">カレンダー表示</option>
              <option value="list">リスト表示</option>
            </Select>
            <Button
              leftIcon={<FiRefreshCw />}
              variant="outline"
              onClick={handleRefresh}
            >
              更新
            </Button>
            <Button
              leftIcon={<FiDownload />}
              colorScheme="primary"
              onClick={handleExportSchedule}
            >
              出力
            </Button>
          </HStack>
        </Flex>

        {/* 統計カード */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <Card>
            <CardBody>
              <VStack align="center" spacing={2}>
                <Text fontSize="2xl" fontWeight="bold" color="green.500">
                  {confirmedShifts}
                </Text>
                <Text fontSize="sm" color="gray.600">確定シフト</Text>
                <Progress value={(confirmedShifts / mockShifts.length) * 100} colorScheme="green" size="sm" w="full" />
              </VStack>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <VStack align="center" spacing={2}>
                <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                  {pendingShifts}
                </Text>
                <Text fontSize="sm" color="gray.600">承認待ち</Text>
                <Progress value={(pendingShifts / mockShifts.length) * 100} colorScheme="orange" size="sm" w="full" />
              </VStack>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <VStack align="center" spacing={2}>
                <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                  {Math.round(totalHours)}
                </Text>
                <Text fontSize="sm" color="gray.600">予定労働時間</Text>
                <Text fontSize="xs" color="gray.500">今月確定分</Text>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {viewMode === 'calendar' ? (
          /* カレンダー表示 */
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                {/* カレンダーヘッダー */}
                <HStack justify="space-between" align="center">
                  <HStack spacing={4}>
                    <Button size="sm" onClick={handlePreviousMonth}>
                      ←
                    </Button>
                    <Heading size="md">
                      {format(currentDate, 'yyyy年M月', { locale: ja })}
                    </Heading>
                    <Button size="sm" onClick={handleNextMonth}>
                      →
                    </Button>
                  </HStack>
                  <Button size="sm" variant="outline" onClick={handleToday}>
                    今月
                  </Button>
                </HStack>

                {/* カレンダーグリッド */}
                <Box>
                  {/* 曜日ヘッダー */}
                  <SimpleGrid columns={7} spacing={1} mb={2}>
                    {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
                      <Box
                        key={index}
                        p={2}
                        textAlign="center"
                        fontWeight="bold"
                        color={index === 0 ? 'red.500' : index === 6 ? 'blue.500' : 'gray.600'}
                        fontSize="sm"
                      >
                        {day}
                      </Box>
                    ))}
                  </SimpleGrid>

                  {/* 日付グリッド */}
                  <SimpleGrid columns={7} spacing={1}>
                    {calendarDays.map((day, index) => {
                      const shift = getShiftForDate(day)
                      const isCurrentMonth = format(day, 'MM') === format(currentDate, 'MM')
                      const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')

                      return (
                        <Box
                          key={index}
                          minH="80px"
                          p={2}
                          border="1px solid"
                          borderColor="gray.200"
                          borderRadius="md"
                          bg={isToday ? 'blue.50' : 'white'}
                          opacity={isCurrentMonth ? 1 : 0.5}
                        >
                          <VStack spacing={1} align="stretch">
                            <Text
                              fontSize="sm"
                              fontWeight={isToday ? 'bold' : 'normal'}
                              color={getDay(day) === 0 ? 'red.500' : getDay(day) === 6 ? 'blue.500' : 'gray.700'}
                            >
                              {format(day, 'd')}
                            </Text>
                            {shift && (
                              <VStack spacing={1} align="stretch">
                                <Badge
                                  size="xs"
                                  colorScheme={getStatusColor(shift.status)}
                                  variant="solid"
                                >
                                  {shift.startTime}-{shift.endTime}
                                </Badge>
                                <Text fontSize="xs" color="gray.600" noOfLines={1}>
                                  {shift.location}
                                </Text>
                              </VStack>
                            )}
                          </VStack>
                        </Box>
                      )
                    })}
                  </SimpleGrid>
                </Box>
              </VStack>
            </CardBody>
          </Card>
        ) : (
          /* リスト表示 */
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading size="md">シフト一覧</Heading>
                
                {mockShifts.length === 0 ? (
                  <Alert status="info">
                    <AlertIcon />
                    シフトが登録されていません。
                  </Alert>
                ) : (
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>日付</Th>
                        <Th>時間</Th>
                        <Th>勤務地</Th>
                        <Th>種別</Th>
                        <Th>ステータス</Th>
                        <Th>備考</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {mockShifts.map((shift) => (
                        <Tr key={shift.id}>
                          <Td>
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="medium">
                                {format(new Date(shift.date), 'M月d日', { locale: ja })}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                {format(new Date(shift.date), 'E', { locale: ja })}
                              </Text>
                            </VStack>
                          </Td>
                          <Td>
                            <Text fontSize="sm">
                              {shift.startTime} - {shift.endTime}
                            </Text>
                          </Td>
                          <Td>
                            <HStack>
                              <FiMapPin size="12" />
                              <Text fontSize="sm">{shift.location}</Text>
                            </HStack>
                          </Td>
                          <Td>
                            <Badge
                              colorScheme={getTypeColor(shift.type)}
                              variant="outline"
                              size="sm"
                            >
                              {getTypeText(shift.type)}
                            </Badge>
                          </Td>
                          <Td>
                            <Badge
                              colorScheme={getStatusColor(shift.status)}
                              variant="solid"
                              size="sm"
                            >
                              {getStatusText(shift.status)}
                            </Badge>
                          </Td>
                          <Td>
                            <Text fontSize="sm" color="gray.600">
                              {shift.notes || '-'}
                            </Text>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                )}
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* 注意事項 */}
        {pendingShifts > 0 && (
          <Alert status="warning">
            <AlertIcon />
            <VStack align="start" spacing={1}>
              <Text fontWeight="medium">承認待ちのシフトがあります</Text>
              <Text fontSize="sm">
                {pendingShifts}件のシフト申請が承認待ちです。管理者の承認をお待ちください。
              </Text>
            </VStack>
          </Alert>
        )}
      </VStack>
    </Box>
  )
}

export default ShiftViewPage