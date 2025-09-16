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
  Select,
  Spinner,
  Center,
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
import { useAuthStore } from '../../store/authStore'
import { api } from '../../utils/api'

interface AttendanceRecord {
  id: string
  date: string
  clockInTime?: string
  clockOutTime?: string
  workingMinutes?: number
  overtimeMinutes?: number
  location?: {
    id: string
    name: string
    address: string
  }
}

interface Location {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
}

interface TodayStatus {
  status: 'NOT_STARTED' | 'WORKING' | 'COMPLETED'
  record?: AttendanceRecord
}

const AttendancePage = () => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [todayStatus, setTodayStatus] = useState<TodayStatus | null>(null)
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedLocationId, setSelectedLocationId] = useState<string>('')
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt')
  const [currentLocation, setCurrentLocation] = useState<{latitude: number, longitude: number, address: string} | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuthStore()
  const toast = useToast()

  // 初期データ読み込み
  useEffect(() => {
    loadInitialData()
  }, [])

  // 現在時刻の更新
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const loadInitialData = async () => {
    setIsLoading(true)
    try {
      await Promise.all([
        loadTodayStatus(),
        loadLocations(),
        loadAttendanceRecords()
      ])
    } catch (error) {
      console.error('データ読み込みエラー:', error)
      toast({
        title: 'エラー',
        description: 'データの読み込みに失敗しました',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadTodayStatus = async () => {
    try {
      const response = await api.get('/attendance/today-status')
      if (response.data.success) {
        setTodayStatus(response.data.data)
      }
    } catch (error) {
      console.error('今日の状態取得エラー:', error)
    }
  }

  const loadLocations = async () => {
    try {
      const response = await api.get('/locations')
      if (response.data.success) {
        setLocations(response.data.data.locations)
        if (response.data.data.locations.length > 0) {
          setSelectedLocationId(response.data.data.locations[0].id)
        }
      }
    } catch (error) {
      console.error('勤務地一覧取得エラー:', error)
    }
  }

  const loadAttendanceRecords = async () => {
    try {
      const response = await api.get('/attendance')
      if (response.data.success) {
        setAttendanceRecords(response.data.data.records || [])
      }
    } catch (error) {
      console.error('勤怠記録取得エラー:', error)
    }
  }

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
        setCurrentLocation({
          latitude,
          longitude,
          address: '現在地を取得中...'
        })
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
    if (!currentLocation || !selectedLocationId) return false
    
    const selectedLocation = locations.find(loc => loc.id === selectedLocationId)
    if (!selectedLocation) return false
    
    const distance = calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      selectedLocation.latitude,
      selectedLocation.longitude
    )
    return distance <= 100 // 100m以内を許可範囲とする
  }

  const handleClockIn = async () => {
    if (locationPermission !== 'granted') {
      getCurrentLocation()
      return
    }

    if (!selectedLocationId) {
      toast({
        title: '勤務地を選択してください',
        description: '出勤する前に勤務地を選択してください',
        status: 'warning',
        duration: 3000,
        isClosable: true
      })
      return
    }

    if (locations.length === 0) {
      toast({
        title: '勤務地が未登録です',
        description: '管理者に勤務地の登録を依頼してください',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
      return
    }

    setIsLoading(true)
    try {
      const clockInData = {
        locationId: selectedLocationId,
        latitude: currentLocation?.latitude || null,
        longitude: currentLocation?.longitude || null,
        address: currentLocation?.address || null
      }

      // デバッグ用ログ
      console.log('Sending clock-in request:', clockInData)
      console.log('Selected location:', locations.find(loc => loc.id === selectedLocationId))

      const response = await api.post('/attendance/clock-in', clockInData)
      
      if (response.data.success) {
        toast({
          title: '出勤しました',
          description: `${format(currentTime, 'HH:mm')} に出勤打刻が完了しました`,
          status: 'success',
          duration: 3000,
          isClosable: true
        })
        await loadTodayStatus()
        await loadAttendanceRecords()
      }
    } catch (error: any) {
      console.error('出勤打刻エラー:', error)
      toast({
        title: 'エラー',
        description: error.response?.data?.error || '出勤打刻に失敗しました',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClockOut = async () => {
    setIsLoading(true)
    try {
      const clockOutData = {
        latitude: currentLocation?.latitude,
        longitude: currentLocation?.longitude,
        address: currentLocation?.address
      }

      const response = await api.post('/attendance/clock-out', clockOutData)
      
      if (response.data.success) {
        toast({
          title: '退勤しました',
          description: `${format(currentTime, 'HH:mm')} に退勤打刻が完了しました`,
          status: 'success',
          duration: 3000,
          isClosable: true
        })
        await loadTodayStatus()
        await loadAttendanceRecords()
      }
    } catch (error: any) {
      console.error('退勤打刻エラー:', error)
      toast({
        title: 'エラー',
        description: error.response?.data?.error || '退勤打刻に失敗しました',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBreakStart = () => {
    // TODO: 休憩機能のAPI実装
    toast({
      title: '休憩開始',
      description: '休憩時間を開始しました',
      status: 'info',
      duration: 2000,
      isClosable: true
    })
  }

  const handleBreakEnd = () => {
    // TODO: 休憩機能のAPI実装
    toast({
      title: '休憩終了',
      description: '業務を再開しました',
      status: 'info',
      duration: 2000,
      isClosable: true
    })
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'WORKING': return 'green'
      case 'COMPLETED': return 'gray'
      case 'NOT_STARTED': 
      default: return 'gray'
    }
  }

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'WORKING': return '勤務中'
      case 'COMPLETED': return '退勤済み'
      case 'NOT_STARTED':
      default: return '未出勤'
    }
  }

  const getTodayWorkHours = () => {
    if (!todayStatus?.record?.workingMinutes) return 0
    return Math.round((todayStatus.record.workingMinutes / 60) * 10) / 10
  }

  const getWeeklyHours = () => {
    const thisWeek = attendanceRecords.filter(record => {
      const recordDate = new Date(record.date)
      const now = new Date()
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
      return recordDate >= weekStart
    })
    
    return thisWeek.map(record => ({
      date: format(new Date(record.date), 'M/d'),
      hours: record.workingMinutes ? Math.round((record.workingMinutes / 60) * 10) / 10 : 0
    }))
  }

  if (isLoading && !todayStatus) {
    return (
      <Center h="400px">
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>読み込み中...</Text>
        </VStack>
      </Center>
    )
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
                  colorScheme={getStatusColor(todayStatus?.status)}
                  fontSize={{ base: 'md', md: 'lg' }}
                  px={{ base: 3, md: 4 }}
                  py={2}
                  borderRadius="full"
                >
                  {getStatusText(todayStatus?.status)}
                </Badge>
                <Text fontSize="sm" color="gray.600">現在のステータス</Text>
              </VStack>

              {/* 出退勤ボタン - モバイル最適化 */}
              <VStack spacing={3} w="full">
                {todayStatus?.status === 'NOT_STARTED' ? (
                  <Button
                    leftIcon={<FiPlay />}
                    colorScheme="green"
                    size={{ base: 'lg', md: 'lg' }}
                    onClick={handleClockIn}
                    isLoading={isLoading}
                    isDisabled={!selectedLocationId}
                    w={{ base: 'full', md: 'auto' }}
                    h={{ base: '60px', md: 'auto' }}
                  >
                    出勤
                  </Button>
                ) : todayStatus?.status === 'WORKING' ? (
                  <VStack spacing={3} w="full">
                    <HStack spacing={{ base: 3, md: 4 }} w="full">
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
                      <Button
                        leftIcon={<FiSquare />}
                        colorScheme="red"
                        onClick={handleClockOut}
                        isLoading={isLoading}
                        flex={1}
                        size={{ base: 'md', md: 'lg' }}
                      >
                        退勤
                      </Button>
                    </HStack>
                  </VStack>
                ) : (
                  <Text fontSize="md" color="gray.500">
                    本日の勤務は終了しました
                  </Text>
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
                        <StatNumber fontSize={{ base: 'lg', md: '2xl' }}>{getTodayWorkHours()}時間</StatNumber>
                        <StatHelpText>
                          <Progress 
                            value={(getTodayWorkHours() / 8) * 100} 
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
                        <StatNumber fontSize={{ base: 'lg', md: '2xl' }}>0時間</StatNumber>
                        <StatHelpText fontSize={{ base: 'xs', md: 'sm' }}>予定: 1.0時間</StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>
                </SimpleGrid>

                <Card bg="gray.50" borderWidth="1px">
                  <CardBody p={3}>
                    <VStack spacing={2} align="stretch">
                      <Text fontSize={{ base: 'xs', md: 'sm' }} fontWeight="medium">今日の記録</Text>
                      {!todayStatus?.record ? (
                        <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.500">まだ記録がありません</Text>
                      ) : (
                        <VStack spacing={2}>
                          {todayStatus.record.clockInTime && (
                            <HStack justify="space-between" w="full">
                              <Badge variant="outline" size="sm">出勤</Badge>
                              <Text fontSize={{ base: 'xs', md: 'sm' }}>
                                {format(new Date(todayStatus.record.clockInTime), 'HH:mm')}
                              </Text>
                            </HStack>
                          )}
                          {todayStatus.record.clockOutTime && (
                            <HStack justify="space-between" w="full">
                              <Badge variant="outline" size="sm">退勤</Badge>
                              <Text fontSize={{ base: 'xs', md: 'sm' }}>
                                {format(new Date(todayStatus.record.clockOutTime), 'HH:mm')}
                              </Text>
                            </HStack>
                          )}
                        </VStack>
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
                      {locations.length > 0 ? (
                        <VStack spacing={2} align="stretch">
                          <Select 
                            value={selectedLocationId}
                            onChange={(e) => setSelectedLocationId(e.target.value)}
                            size="sm"
                          >
                            {locations.map(location => (
                              <option key={location.id} value={location.id}>
                                {location.name} - {location.address}
                              </option>
                            ))}
                          </Select>
                          <Text fontSize="xs" color="gray.500">
                            許可範囲: 100m
                          </Text>
                        </VStack>
                      ) : (
                        <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.500">
                          勤務地が登録されていません
                        </Text>
                      )}
                    </CardBody>
                  </Card>
                  
                  <Card bg="green.50" borderColor="green.200" borderWidth="1px">
                    <CardBody p={3}>
                      <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.600" mb={1}>現在地</Text>
                      <HStack spacing={2}>
                        <FiNavigation />
                        <Text fontSize={{ base: 'xs', md: 'sm' }}>
                          {currentLocation?.address || '位置情報を取得してください'}
                        </Text>
                      </HStack>
                      {currentLocation && (
                        <Badge 
                          colorScheme={isWithinWorkLocation() ? 'green' : 'red'} 
                          size="sm" 
                          mt={1}
                        >
                          {isWithinWorkLocation() ? '勤務地内' : '勤務地外'}
                        </Badge>
                      )}
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
                    {getWeeklyHours().map((day, index) => (
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
                      {getWeeklyHours().map((day, index) => (
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
                      週合計: {getWeeklyHours().reduce((sum, day) => sum + day.hours, 0)}時間
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