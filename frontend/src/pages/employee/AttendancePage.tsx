import React, { useState, useEffect } from 'react'
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Card,
  CardBody,
  Badge,
  useToast,
  Alert,
  AlertIcon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Progress,
  Flex,
  Spacer,
  IconButton,
  Tooltip,
} from '@chakra-ui/react'
import { 
  FiMapPin, 
  FiClock, 
  FiPlay, 
  FiSquare, 
  FiRefreshCw,
  FiNavigation,
  FiCalendar
} from 'react-icons/fi'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

// ダミーデータ
const mockAttendanceData = {
  currentStatus: 'off', // 'working' | 'break' | 'off'
  todayWorkTime: 6.5, // hours
  todayBreakTime: 0.5, // hours
  currentLocation: {
    latitude: 35.6762,
    longitude: 139.6503,
    address: '東京都港区赤坂1-1-1'
  },
  workLocation: {
    latitude: 35.6762,
    longitude: 139.6503,
    address: '東京営業所',
    allowedRadius: 100 // meters
  },
  todayRecords: [
    { type: 'start', time: '09:00', location: '東京営業所' },
    { type: 'break_start', time: '12:00', location: '東京営業所' },
    { type: 'break_end', time: '13:00', location: '東京営業所' },
  ],
  weeklyHours: [
    { date: '9/16', hours: 8.0 },
    { date: '9/17', hours: 7.5 },
    { date: '9/18', hours: 8.5 },
    { date: '9/19', hours: 6.5 },
    { date: '9/20', hours: 0 },
  ]
}

const AttendancePage = () => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [attendanceData, setAttendanceData] = useState(mockAttendanceData)
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt')
  const toast = useToast()

  // 現在時刻の更新
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // 位置情報の取得
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: 'エラー',
        description: 'お使いのブラウザは位置情報機能に対応していません',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setAttendanceData(prev => ({
          ...prev,
          currentLocation: {
            latitude,
            longitude,
            address: '現在地を取得中...'
          }
        }))
        setLocationPermission('granted')
        toast({
          title: '位置情報を取得しました',
          status: 'success',
          duration: 2000,
          isClosable: true
        })
      },
      (error) => {
        setLocationPermission('denied')
        toast({
          title: '位置情報の取得に失敗しました',
          description: '位置情報の使用を許可してください',
          status: 'error',
          duration: 5000,
          isClosable: true
        })
      }
    )
  }

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    // 簡易的な距離計算（実際は適切な計算式を使用）
    const R = 6371e3 // 地球の半径（メートル）
    const φ1 = lat1 * Math.PI/180
    const φ2 = lat2 * Math.PI/180
    const Δφ = (lat2-lat1) * Math.PI/180
    const Δλ = (lon2-lon1) * Math.PI/180

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

    return R * c
  }

  const isWithinWorkLocation = () => {
    const distance = calculateDistance(
      attendanceData.currentLocation.latitude,
      attendanceData.currentLocation.longitude,
      attendanceData.workLocation.latitude,
      attendanceData.workLocation.longitude
    )
    return distance <= attendanceData.workLocation.allowedRadius
  }

  const handleClockIn = () => {
    if (locationPermission !== 'granted') {
      getCurrentLocation()
      return
    }

    if (!isWithinWorkLocation()) {
      toast({
        title: '勤務地から離れています',
        description: '指定された勤務地の範囲内で出勤打刻を行ってください',
        status: 'warning',
        duration: 5000,
        isClosable: true
      })
      return
    }

    setAttendanceData(prev => ({
      ...prev,
      currentStatus: 'working',
      todayRecords: [...prev.todayRecords, {
        type: 'start',
        time: format(currentTime, 'HH:mm'),
        location: prev.workLocation.address
      }]
    }))

    toast({
      title: '出勤しました',
      description: `${format(currentTime, 'HH:mm')} に出勤打刻が完了しました`,
      status: 'success',
      duration: 3000,
      isClosable: true
    })
  }

  const handleClockOut = () => {
    setAttendanceData(prev => ({
      ...prev,
      currentStatus: 'off',
      todayRecords: [...prev.todayRecords, {
        type: 'end',
        time: format(currentTime, 'HH:mm'),
        location: prev.workLocation.address
      }]
    }))

    toast({
      title: '退勤しました',
      description: `${format(currentTime, 'HH:mm')} に退勤打刻が完了しました`,
      status: 'success',
      duration: 3000,
      isClosable: true
    })
  }

  const handleBreakStart = () => {
    setAttendanceData(prev => ({
      ...prev,
      currentStatus: 'break',
      todayRecords: [...prev.todayRecords, {
        type: 'break_start',
        time: format(currentTime, 'HH:mm'),
        location: prev.workLocation.address
      }]
    }))

    toast({
      title: '休憩開始',
      description: '休憩時間を開始しました',
      status: 'info',
      duration: 2000,
      isClosable: true
    })
  }

  const handleBreakEnd = () => {
    setAttendanceData(prev => ({
      ...prev,
      currentStatus: 'working',
      todayRecords: [...prev.todayRecords, {
        type: 'break_end',
        time: format(currentTime, 'HH:mm'),
        location: prev.workLocation.address
      }]
    }))

    toast({
      title: '休憩終了',
      description: '業務を再開しました',
      status: 'info',
      duration: 2000,
      isClosable: true
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'working': return 'green'
      case 'break': return 'yellow'
      case 'off': return 'gray'
      default: return 'gray'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'working': return '勤務中'
      case 'break': return '休憩中'
      case 'off': return '退勤'
      default: return '未出勤'
    }
  }

  const getRecordTypeText = (type: string) => {
    switch (type) {
      case 'start': return '出勤'
      case 'end': return '退勤'
      case 'break_start': return '休憩開始'
      case 'break_end': return '休憩終了'
      default: return type
    }
  }

  return (
    <Box p={{ base: 3, md: 6 }}>
      <VStack spacing={{ base: 4, md: 6 }} align="stretch">
        {/* ヘッダー - モバイル最適化 */}
        <VStack spacing={{ base: 3, md: 1 }} align="stretch">
          <VStack align="start" spacing={1}>
            <Heading size={{ base: 'md', md: 'lg' }}>📍 GPS勤怠管理</Heading>
            <Text color="gray.600" fontSize={{ base: 'sm', md: 'md' }}>
              位置情報を利用した出退勤管理
            </Text>
          </VStack>
          <Card bg="primary.50" borderColor="primary.200" borderWidth="1px">
            <CardBody p={{ base: 3, md: 4 }}>
              <VStack spacing={1}>
                <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold" color="primary.700">
                  {format(currentTime, 'HH:mm:ss')}
                </Text>
                <Text fontSize={{ base: 'sm', md: 'md' }} color="primary.600">
                  {format(currentTime, 'yyyy年M月d日(E)', { locale: ja })}
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </VStack>

        {/* 位置情報アラート */}
        {locationPermission === 'denied' && (
          <Alert status="warning">
            <AlertIcon />
            <VStack align="start" spacing={1}>
              <Text fontWeight="medium">位置情報が無効です</Text>
              <Text fontSize="sm">
                出退勤打刻には位置情報の許可が必要です。ブラウザの設定を確認してください。
              </Text>
            </VStack>
          </Alert>
        )}

        {/* 現在のステータス - モバイル最適化 */}
        <Card>
          <CardBody p={{ base: 4, md: 6 }}>
            <VStack spacing={{ base: 4, md: 4 }}>
              <VStack spacing={2}>
                <Badge
                  colorScheme={getStatusColor(attendanceData.currentStatus)}
                  fontSize={{ base: 'md', md: 'lg' }}
                  px={{ base: 3, md: 4 }}
                  py={2}
                  borderRadius="full"
                >
                  {getStatusText(attendanceData.currentStatus)}
                </Badge>
                <Text fontSize="sm" color="gray.600">現在のステータス</Text>
              </VStack>

              {/* 出退勤ボタン - モバイル最適化 */}
              <VStack spacing={3} w="full">
                {attendanceData.currentStatus === 'off' ? (
                  <Button
                    leftIcon={<FiPlay />}
                    colorScheme="green"
                    size={{ base: 'lg', md: 'lg' }}
                    onClick={handleClockIn}
                    isDisabled={locationPermission !== 'granted'}
                    w={{ base: 'full', md: 'auto' }}
                    h={{ base: '60px', md: 'auto' }}
                  >
                    出勤
                  </Button>
                ) : (
                  <VStack spacing={3} w="full">
                    <HStack spacing={{ base: 3, md: 4 }} w="full">
                      {attendanceData.currentStatus === 'working' ? (
                        <Button
                          leftIcon={<FiClock />}
                          colorScheme="yellow"
                          variant="outline"
                          onClick={handleBreakStart}
                          flex={1}
                          size={{ base: 'md', md: 'lg' }}
                        >
                          休憩開始
                        </Button>
                      ) : (
                        <Button
                          leftIcon={<FiPlay />}
                          colorScheme="blue"
                          variant="outline"
                          onClick={handleBreakEnd}
                          flex={1}
                          size={{ base: 'md', md: 'lg' }}
                        >
                          休憩終了
                        </Button>
                      )}
                      <Button
                        leftIcon={<FiSquare />}
                        colorScheme="red"
                        onClick={handleClockOut}
                        flex={1}
                        size={{ base: 'md', md: 'lg' }}
                      >
                        退勤
                      </Button>
                    </HStack>
                  </VStack>
                )}
              </VStack>

              {/* 位置情報更新ボタン */}
              <Button
                leftIcon={<FiNavigation />}
                size="sm"
                variant="ghost"
                onClick={getCurrentLocation}
              >
                現在地を更新
              </Button>
            </VStack>
          </CardBody>
        </Card>

        <VStack spacing={{ base: 4, md: 6 }} align="stretch">
          {/* 今日の実績 - モバイル最適化 */}
          <Card>
            <CardBody p={{ base: 3, md: 6 }}>
              <VStack spacing={{ base: 3, md: 4 }} align="stretch">
                <Heading size={{ base: 'sm', md: 'md' }}>今日の実績</Heading>
                
                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={{ base: 3, md: 4 }}>
                  <Card bg="blue.50" borderColor="blue.200" borderWidth="1px">
                    <CardBody p={{ base: 3, md: 4 }}>
                      <Stat>
                        <StatLabel fontSize={{ base: 'xs', md: 'sm' }}>労働時間</StatLabel>
                        <StatNumber fontSize={{ base: 'lg', md: '2xl' }}>{attendanceData.todayWorkTime}時間</StatNumber>
                        <StatHelpText>
                          <Progress 
                            value={(attendanceData.todayWorkTime / 8) * 100} 
                            colorScheme="blue" 
                            size="sm" 
                            mt={1}
                          />
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>
                  
                  <Card bg="green.50" borderColor="green.200" borderWidth="1px">
                    <CardBody p={{ base: 3, md: 4 }}>
                      <Stat>
                        <StatLabel fontSize={{ base: 'xs', md: 'sm' }}>休憩時間</StatLabel>
                        <StatNumber fontSize={{ base: 'lg', md: '2xl' }}>{attendanceData.todayBreakTime}時間</StatNumber>
                        <StatHelpText fontSize={{ base: 'xs', md: 'sm' }}>予定: 1.0時間</StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>
                </SimpleGrid>

                <Card bg="gray.50" borderWidth="1px">
                  <CardBody p={3}>
                    <VStack spacing={2} align="stretch">
                      <Text fontSize={{ base: 'xs', md: 'sm' }} fontWeight="medium">今日の記録</Text>
                      {attendanceData.todayRecords.length === 0 ? (
                        <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.500">まだ記録がありません</Text>
                      ) : (
                        attendanceData.todayRecords.map((record, index) => (
                          <HStack key={index} justify="space-between">
                            <Badge variant="outline" size="sm">
                              {getRecordTypeText(record.type)}
                            </Badge>
                            <Text fontSize={{ base: 'xs', md: 'sm' }}>{record.time}</Text>
                          </HStack>
                        ))
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </CardBody>
          </Card>

          {/* 位置情報 - モバイル最適化 */}
          <Card>
            <CardBody p={{ base: 3, md: 6 }}>
              <VStack spacing={{ base: 3, md: 4 }} align="stretch">
                <Heading size={{ base: 'sm', md: 'md' }}>位置情報</Heading>
                
                <VStack spacing={{ base: 2, md: 3 }} align="stretch">
                  <Card bg="blue.50" borderColor="blue.200" borderWidth="1px">
                    <CardBody p={3}>
                      <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.600" mb={1}>勤務地</Text>
                      <HStack spacing={2}>
                        <FiMapPin />
                        <Text fontSize={{ base: 'xs', md: 'sm' }}>{attendanceData.workLocation.address}</Text>
                      </HStack>
                      <Text fontSize="xs" color="gray.500">
                        許可範囲: {attendanceData.workLocation.allowedRadius}m
                      </Text>
                    </CardBody>
                  </Card>
                  
                  <Card bg="green.50" borderColor="green.200" borderWidth="1px">
                    <CardBody p={3}>
                      <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.600" mb={1}>現在地</Text>
                      <HStack spacing={2}>
                        <FiNavigation />
                        <Text fontSize={{ base: 'xs', md: 'sm' }}>{attendanceData.currentLocation.address}</Text>
                      </HStack>
                      <Badge 
                        colorScheme={isWithinWorkLocation() ? 'green' : 'red'} 
                        size="sm" 
                        mt={1}
                      >
                        {isWithinWorkLocation() ? '勤務地内' : '勤務地外'}
                      </Badge>
                    </CardBody>
                  </Card>
                </VStack>
              </VStack>
            </CardBody>
          </Card>

          {/* 今週の勤務時間 - モバイル最適化 */}
          <Card>
            <CardBody p={{ base: 3, md: 6 }}>
              <VStack spacing={{ base: 3, md: 4 }} align="stretch">
                <Heading size={{ base: 'sm', md: 'md' }}>今週の勤務時間</Heading>
                
                {/* モバイル用カードリスト */}
                <Box display={{ base: 'block', md: 'none' }}>
                  <VStack spacing={2}>
                    {attendanceData.weeklyHours.map((day, index) => (
                      <Card key={index} w="full" size="sm" bg="gray.50">
                        <CardBody p={3}>
                          <HStack justify="space-between" align="center">
                            <VStack align="start" spacing={0}>
                              <Text fontSize="sm" fontWeight="medium">{day.date}</Text>
                              <Text fontSize="xs" color="gray.600">{day.hours}時間</Text>
                            </VStack>
                            <Box flex={1} ml={4}>
                              <Progress
                                value={(day.hours / 8) * 100}
                                colorScheme={day.hours >= 8 ? 'green' : 'blue'}
                                size="sm"
                              />
                            </Box>
                          </HStack>
                        </CardBody>
                      </Card>
                    ))}
                  </VStack>
                </Box>

                {/* デスクトップ用テーブル */}
                <Box display={{ base: 'none', md: 'block' }}>
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>日付</Th>
                        <Th>勤務時間</Th>
                        <Th>進捗</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {attendanceData.weeklyHours.map((day, index) => (
                        <Tr key={index}>
                          <Td>{day.date}</Td>
                          <Td>{day.hours}時間</Td>
                          <Td>
                            <Progress
                              value={(day.hours / 8) * 100}
                              colorScheme={day.hours >= 8 ? 'green' : 'blue'}
                              size="sm"
                              width="100px"
                            />
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
                
                <Card bg="primary.50" borderColor="primary.200" borderWidth="1px">
                  <CardBody p={3}>
                    <Text fontSize={{ base: 'sm', md: 'md' }} fontWeight="medium" color="primary.700">
                      週合計: {attendanceData.weeklyHours.reduce((sum, day) => sum + day.hours, 0)}時間
                    </Text>
                  </CardBody>
                </Card>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </VStack>
    </Box>
  )
}

export default AttendancePage