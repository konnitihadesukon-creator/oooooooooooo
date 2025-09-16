import React, { useState, useEffect } from 'react'
import {
  Box,
  Heading,
  Text,
  Card,
  CardBody,
  VStack,
  HStack,
  Button,
  Select,
  Textarea,
  Grid,
  GridItem,
  Badge,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Spinner,
  Center
} from '@chakra-ui/react'
import { FiCalendar, FiSave, FiCheck, FiX, FiClock } from 'react-icons/fi'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns'
import { ja } from 'date-fns/locale'

type AvailabilityStatus = 'AVAILABLE' | 'UNAVAILABLE' | 'UNDECIDED'

interface ShiftRequest {
  id?: string
  month: string
  dates: Record<string, AvailabilityStatus>
  comment?: string
  submittedAt?: string
}

const ShiftRequestPage: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date())
  const [shiftRequest, setShiftRequest] = useState<ShiftRequest | null>(null)
  const [dates, setDates] = useState<Record<string, AvailabilityStatus>>({})
  const [comment, setComment] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const cancelRef = React.useRef<HTMLButtonElement>(null)
  const toast = useToast()

  // 月の選択肢を生成（今月〜3ヶ月先まで）
  const monthOptions = Array.from({ length: 4 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() + i)
    return date
  })

  // 指定月の日付一覧を取得
  const getDaysInMonth = (date: Date) => {
    const start = startOfMonth(date)
    const end = endOfMonth(date)
    return eachDayOfInterval({ start, end })
  }

  // シフト要求の読み込み
  const loadShiftRequest = async (month: Date) => {
    setIsLoading(true)
    try {
      const monthString = format(month, 'yyyy-MM')
      // TODO: APIから既存のシフト要求を取得
      // const response = await fetch(`/api/shifts/requests?month=${monthString}`)
      // const data = await response.json()
      
      // 仮のデータ
      setTimeout(() => {
        const existingRequest = {
          month: monthString,
          dates: {},
          comment: ''
        }
        setShiftRequest(existingRequest)
        setDates(existingRequest.dates)
        setComment(existingRequest.comment || '')
        setIsLoading(false)
      }, 500)
    } catch (error) {
      console.error('シフト要求読み込みエラー:', error)
      setIsLoading(false)
      toast({
        title: 'エラー',
        description: 'シフト要求の読み込みに失敗しました',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    }
  }

  // 月変更時の処理
  useEffect(() => {
    loadShiftRequest(selectedMonth)
  }, [selectedMonth])

  // 日付の可用性を切り替え
  const toggleDateAvailability = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd')
    const currentStatus = dates[dateKey] || 'UNDECIDED'
    
    let newStatus: AvailabilityStatus
    switch (currentStatus) {
      case 'UNDECIDED':
        newStatus = 'AVAILABLE'
        break
      case 'AVAILABLE':
        newStatus = 'UNAVAILABLE'
        break
      case 'UNAVAILABLE':
        newStatus = 'UNDECIDED'
        break
      default:
        newStatus = 'AVAILABLE'
    }
    
    setDates(prev => ({
      ...prev,
      [dateKey]: newStatus
    }))
  }

  // 一括設定
  const setAllDates = (status: AvailabilityStatus) => {
    const daysInMonth = getDaysInMonth(selectedMonth)
    const newDates: Record<string, AvailabilityStatus> = {}
    
    daysInMonth.forEach(date => {
      const dateKey = format(date, 'yyyy-MM-dd')
      newDates[dateKey] = status
    })
    
    setDates(newDates)
  }

  // 保存処理
  const saveShiftRequest = async () => {
    setIsSaving(true)
    try {
      const requestData: ShiftRequest = {
        month: format(selectedMonth, 'yyyy-MM'),
        dates,
        comment: comment.trim()
      }

      // TODO: APIに送信
      // const response = await fetch('/api/shifts/requests', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(requestData)
      // })

      setTimeout(() => {
        setIsSaving(false)
        toast({
          title: '保存完了',
          description: 'シフト希望を保存しました',
          status: 'success',
          duration: 3000,
          isClosable: true
        })
        onClose()
      }, 1000)
    } catch (error) {
      console.error('保存エラー:', error)
      setIsSaving(false)
      toast({
        title: 'エラー',
        description: 'シフト希望の保存に失敗しました',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    }
  }

  // ステータス表示用の設定
  const getStatusConfig = (status: AvailabilityStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return {
          color: 'green.500',
          bg: 'green.50',
          borderColor: 'green.200',
          icon: FiCheck,
          text: '◯'
        }
      case 'UNAVAILABLE':
        return {
          color: 'red.500',
          bg: 'red.50',
          borderColor: 'red.200',
          icon: FiX,
          text: '×'
        }
      case 'UNDECIDED':
      default:
        return {
          color: 'gray.400',
          bg: 'gray.50',
          borderColor: 'gray.200',
          icon: FiClock,
          text: '△'
        }
    }
  }

  if (isLoading) {
    return (
      <Center py={20}>
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>読み込み中...</Text>
        </VStack>
      </Center>
    )
  }

  return (
    <Box>
      <VStack align="start" spacing={4} mb={6}>
        <Heading size="lg">シフト希望提出</Heading>
        <Text color="gray.600">
          希望する月を選択して、勤務可能日をマークしてください
        </Text>
      </VStack>

      {/* 月選択 */}
      <Card mb={6}>
        <CardBody>
          <VStack spacing={4}>
            <HStack spacing={4} w="full" justify="space-between">
              <Box>
                <Text fontSize="sm" color="gray.600" mb={2}>対象月</Text>
                <Select 
                  value={selectedMonth.toISOString()}
                  onChange={(e) => setSelectedMonth(new Date(e.target.value))}
                  maxW="200px"
                >
                  {monthOptions.map(month => (
                    <option key={month.toISOString()} value={month.toISOString()}>
                      {format(month, 'yyyy年M月', { locale: ja })}
                    </option>
                  ))}
                </Select>
              </Box>

              <HStack spacing={2}>
                <Button size="sm" onClick={() => setAllDates('AVAILABLE')} colorScheme="green">
                  全て◯
                </Button>
                <Button size="sm" onClick={() => setAllDates('UNAVAILABLE')} colorScheme="red">
                  全て×
                </Button>
                <Button size="sm" onClick={() => setAllDates('UNDECIDED')} colorScheme="gray">
                  全て△
                </Button>
              </HStack>
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      {/* カレンダー */}
      <Card mb={6}>
        <CardBody>
          <VStack spacing={4}>
            <Text fontWeight="bold" fontSize="lg">
              {format(selectedMonth, 'yyyy年M月', { locale: ja })}
            </Text>

            {/* 凡例 */}
            <HStack spacing={6} justify="center" w="full">
              <HStack>
                <Box w={4} h={4} bg="green.500" borderRadius="sm" />
                <Text fontSize="sm">勤務可能（◯）</Text>
              </HStack>
              <HStack>
                <Box w={4} h={4} bg="red.500" borderRadius="sm" />
                <Text fontSize="sm">勤務不可（×）</Text>
              </HStack>
              <HStack>
                <Box w={4} h={4} bg="gray.400" borderRadius="sm" />
                <Text fontSize="sm">未定（△）</Text>
              </HStack>
            </HStack>

            {/* 曜日ヘッダー */}
            <Grid templateColumns="repeat(7, 1fr)" gap={2} w="full">
              {['日', '月', '火', '水', '木', '金', '土'].map(day => (
                <GridItem key={day}>
                  <Center 
                    h={10} 
                    fontWeight="bold" 
                    color={day === '日' ? 'red.500' : day === '土' ? 'blue.500' : 'gray.600'}
                  >
                    {day}
                  </Center>
                </GridItem>
              ))}
            </Grid>

            {/* 日付グリッド */}
            <Grid templateColumns="repeat(7, 1fr)" gap={2} w="full">
              {getDaysInMonth(selectedMonth).map(date => {
                const dateKey = format(date, 'yyyy-MM-dd')
                const status = dates[dateKey] || 'UNDECIDED'
                const statusConfig = getStatusConfig(status)
                const dayOfWeek = date.getDay()

                return (
                  <GridItem key={dateKey}>
                    <Button
                      w="full"
                      h={12}
                      variant="outline"
                      bg={statusConfig.bg}
                      borderColor={statusConfig.borderColor}
                      color={statusConfig.color}
                      _hover={{
                        bg: statusConfig.bg,
                        transform: 'scale(1.05)'
                      }}
                      onClick={() => toggleDateAvailability(date)}
                      isDisabled={!isSameMonth(date, selectedMonth)}
                    >
                      <VStack spacing={0}>
                        <Text 
                          fontSize="xs" 
                          color={dayOfWeek === 0 ? 'red.500' : dayOfWeek === 6 ? 'blue.500' : 'inherit'}
                        >
                          {format(date, 'd')}
                        </Text>
                        <Text fontSize="lg" fontWeight="bold">
                          {statusConfig.text}
                        </Text>
                      </VStack>
                    </Button>
                  </GridItem>
                )
              })}
            </Grid>
          </VStack>
        </CardBody>
      </Card>

      {/* コメント */}
      <Card mb={6}>
        <CardBody>
          <VStack align="start" spacing={4}>
            <Text fontWeight="medium">コメント（任意）</Text>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="シフト希望に関するコメントがあれば記入してください"
              rows={3}
            />
          </VStack>
        </CardBody>
      </Card>

      {/* アクション */}
      <HStack spacing={4} justify="flex-end">
        <Button
          leftIcon={<FiSave />}
          colorScheme="blue"
          size="lg"
          onClick={onOpen}
        >
          シフト希望を提出
        </Button>
      </HStack>

      {/* 確認ダイアログ */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              シフト希望提出
            </AlertDialogHeader>

            <AlertDialogBody>
              {format(selectedMonth, 'yyyy年M月', { locale: ja })}のシフト希望を提出しますか？
              <Box mt={4} p={4} bg="gray.50" borderRadius="md">
                <Text fontSize="sm" color="gray.600">
                  ◯：{Object.values(dates).filter(s => s === 'AVAILABLE').length}日 /
                  ×：{Object.values(dates).filter(s => s === 'UNAVAILABLE').length}日 /
                  △：{Object.values(dates).filter(s => s === 'UNDECIDED').length}日
                </Text>
              </Box>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                キャンセル
              </Button>
              <Button 
                colorScheme="blue" 
                onClick={saveShiftRequest} 
                ml={3}
                isLoading={isSaving}
                loadingText="提出中..."
              >
                提出する
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  )
}

export default ShiftRequestPage