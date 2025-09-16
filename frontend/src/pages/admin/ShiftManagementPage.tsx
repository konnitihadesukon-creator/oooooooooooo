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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Avatar,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  IconButton,
  Tooltip,
  useToast,
  Flex,
} from '@chakra-ui/react'
import { FiCalendar, FiCheck, FiX, FiEye, FiDownload } from 'react-icons/fi'

// ダミーデータ
const mockShiftRequests = [
  {
    id: '1',
    employeeName: '田中太郎',
    employeeId: 'emp001',
    date: '2024-09-20',
    startTime: '09:00',
    endTime: '18:00',
    location: '東京営業所',
    status: 'pending',
    requestDate: '2024-09-16T10:00:00Z',
    comment: 'この日は特に重要な配送があります'
  },
  {
    id: '2',
    employeeName: '佐藤花子',
    employeeId: 'emp002',
    date: '2024-09-21',
    startTime: '08:00',
    endTime: '17:00',
    location: '大阪営業所',
    status: 'approved',
    requestDate: '2024-09-15T14:30:00Z',
    comment: ''
  },
  {
    id: '3',
    employeeName: '鈴木一郎',
    employeeId: 'emp003',
    date: '2024-09-22',
    startTime: '10:00',
    endTime: '19:00',
    location: '名古屋営業所',
    status: 'rejected',
    requestDate: '2024-09-14T09:15:00Z',
    comment: '急用で対応できません'
  }
]

const ShiftManagementPage = () => {
  const [shiftRequests, setShiftRequests] = useState(mockShiftRequests)
  const toast = useToast()

  const handleApproveShift = (id: string, employeeName: string) => {
    setShiftRequests(prev => prev.map(shift =>
      shift.id === id ? { ...shift, status: 'approved' } : shift
    ))
    toast({
      title: 'シフト申請を承認しました',
      description: `${employeeName}さんのシフト申請を承認しました`,
      status: 'success',
      duration: 3000,
      isClosable: true
    })
  }

  const handleRejectShift = (id: string, employeeName: string) => {
    setShiftRequests(prev => prev.map(shift =>
      shift.id === id ? { ...shift, status: 'rejected' } : shift
    ))
    toast({
      title: 'シフト申請を却下しました',
      description: `${employeeName}さんのシフト申請を却下しました`,
      status: 'warning',
      duration: 3000,
      isClosable: true
    })
  }

  const handleViewDetails = (id: string) => {
    toast({
      title: 'シフト詳細',
      description: `シフトID: ${id} の詳細表示機能は開発中です`,
      status: 'info',
      duration: 3000,
      isClosable: true
    })
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

  const pendingCount = shiftRequests.filter(shift => shift.status === 'pending').length
  const approvedCount = shiftRequests.filter(shift => shift.status === 'approved').length
  const rejectedCount = shiftRequests.filter(shift => shift.status === 'rejected').length

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'yellow'
      case 'approved': return 'green'
      case 'rejected': return 'red'
      default: return 'gray'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '承認待ち'
      case 'approved': return '承認済み'
      case 'rejected': return '却下'
      default: return '不明'
    }
  }

  return (
    <Box p={{ base: 3, md: 6 }}>
      <VStack spacing={{ base: 4, md: 6 }} align="stretch">
        {/* ヘッダー - モバイル最適化 */}
        <VStack spacing={{ base: 3, md: 1 }} align="stretch">
          <VStack align="start" spacing={1}>
            <Heading size={{ base: 'md', md: 'lg' }}>📋 シフト管理</Heading>
            <Text color="gray.600" fontSize={{ base: 'sm', md: 'md' }}>
              シフト申請の承認と管理
            </Text>
          </VStack>
          <HStack spacing={3} w="full" flexWrap={{ base: 'wrap', md: 'nowrap' }}>
            <Button
              leftIcon={<FiCalendar />}
              variant="outline"
              onClick={handleExportSchedule}
              size={{ base: 'sm', md: 'md' }}
              flex={{ base: '1', md: 'none' }}
            >
              スケジュール出力
            </Button>
            <Button
              leftIcon={<FiDownload />}
              colorScheme="primary"
              onClick={handleExportSchedule}
              size={{ base: 'sm', md: 'md' }}
              flex={{ base: '1', md: 'none' }}
            >
              CSV出力
            </Button>
          </HStack>
        </VStack>

        {/* 統計カード - モバイル最適化 */}
        <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={{ base: 3, md: 4 }}>
          <Card>
            <CardBody p={{ base: 3, md: 6 }}>
              <Stat>
                <StatLabel fontSize={{ base: 'xs', md: 'sm' }}>承認待ち</StatLabel>
                <StatNumber color="orange.500" fontSize={{ base: 'lg', md: '2xl' }}>{pendingCount}</StatNumber>
                <StatHelpText fontSize={{ base: 'xs', md: 'sm' }}>要確認の申請</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody p={{ base: 3, md: 6 }}>
              <Stat>
                <StatLabel fontSize={{ base: 'xs', md: 'sm' }}>承認済み</StatLabel>
                <StatNumber color="green.500" fontSize={{ base: 'lg', md: '2xl' }}>{approvedCount}</StatNumber>
                <StatHelpText fontSize={{ base: 'xs', md: 'sm' }}>今月承認分</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody p={{ base: 3, md: 6 }}>
              <Stat>
                <StatLabel fontSize={{ base: 'xs', md: 'sm' }}>却下</StatLabel>
                <StatNumber color="red.500" fontSize={{ base: 'lg', md: '2xl' }}>{rejectedCount}</StatNumber>
                <StatHelpText fontSize={{ base: 'xs', md: 'sm' }}>今月却下分</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* シフト申請一覧 - レスポンシブ対応 */}
        <Card>
          <CardBody p={{ base: 3, md: 6 }}>
            <VStack spacing={{ base: 3, md: 4 }} align="stretch">
              <Heading size={{ base: 'sm', md: 'md' }}>シフト申請一覧</Heading>
              
              {/* モバイル用カードリスト */}
              <Box display={{ base: 'block', md: 'none' }}>
                <VStack spacing={3}>
                  {shiftRequests.map((shift) => (
                    <Card key={shift.id} w="full" size="sm">
                      <CardBody p={3}>
                        <VStack spacing={3} align="stretch">
                          <HStack justify="space-between" align="start">
                            <HStack spacing={3} flex={1}>
                              <Avatar size="sm" name={shift.employeeName} />
                              <VStack align="start" spacing={0} flex={1}>
                                <Text fontWeight="medium" fontSize="sm">{shift.employeeName}</Text>
                                <Text fontSize="xs" color="gray.500">{shift.employeeId}</Text>
                              </VStack>
                            </HStack>
                            <Badge
                              colorScheme={getStatusColor(shift.status)}
                              variant="solid"
                              size="sm"
                            >
                              {getStatusText(shift.status)}
                            </Badge>
                          </HStack>
                          
                          <VStack spacing={2} align="stretch">
                            <HStack justify="space-between">
                              <Text fontSize="xs" color="gray.600">勤務日</Text>
                              <Text fontSize="xs" fontWeight="medium">
                                {new Date(shift.date).toLocaleDateString('ja-JP', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  weekday: 'short'
                                })}
                              </Text>
                            </HStack>
                            <HStack justify="space-between">
                              <Text fontSize="xs" color="gray.600">時間</Text>
                              <Text fontSize="xs">{shift.startTime} - {shift.endTime}</Text>
                            </HStack>
                            <HStack justify="space-between">
                              <Text fontSize="xs" color="gray.600">勤務地</Text>
                              <Text fontSize="xs">{shift.location}</Text>
                            </HStack>
                            <HStack justify="space-between">
                              <Text fontSize="xs" color="gray.600">申請日</Text>
                              <Text fontSize="xs">
                                {new Date(shift.requestDate).toLocaleDateString('ja-JP')}
                              </Text>
                            </HStack>
                          </VStack>
                          
                          <HStack justify="center" spacing={2}>
                            <IconButton
                              aria-label="詳細表示"
                              icon={<FiEye />}
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewDetails(shift.id)}
                            />
                            {shift.status === 'pending' && (
                              <>
                                <IconButton
                                  aria-label="承認"
                                  icon={<FiCheck />}
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="green"
                                  onClick={() => handleApproveShift(shift.id, shift.employeeName)}
                                />
                                <IconButton
                                  aria-label="却下"
                                  icon={<FiX />}
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="red"
                                  onClick={() => handleRejectShift(shift.id, shift.employeeName)}
                                />
                              </>
                            )}
                          </HStack>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              </Box>

              {/* デスクトップ用テーブル */}
              <Box display={{ base: 'none', md: 'block' }}>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>従業員</Th>
                      <Th>勤務日</Th>
                      <Th>勤務時間</Th>
                      <Th>勤務地</Th>
                      <Th>申請日</Th>
                      <Th>ステータス</Th>
                      <Th>操作</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {shiftRequests.map((shift) => (
                      <Tr key={shift.id}>
                        <Td>
                          <HStack>
                            <Avatar size="sm" name={shift.employeeName} />
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="medium">{shift.employeeName}</Text>
                              <Text fontSize="xs" color="gray.500">{shift.employeeId}</Text>
                            </VStack>
                          </HStack>
                        </Td>
                        <Td>
                          <Text fontWeight="medium">
                            {new Date(shift.date).toLocaleDateString('ja-JP', { 
                              month: 'long', 
                              day: 'numeric',
                              weekday: 'short'
                            })}
                          </Text>
                        </Td>
                        <Td>
                          <Text fontSize="sm">
                            {shift.startTime} - {shift.endTime}
                          </Text>
                        </Td>
                        <Td>
                          <Text fontSize="sm">{shift.location}</Text>
                        </Td>
                        <Td>
                          <Text fontSize="sm">
                            {new Date(shift.requestDate).toLocaleDateString('ja-JP')}
                          </Text>
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={getStatusColor(shift.status)}
                            variant="solid"
                          >
                            {getStatusText(shift.status)}
                          </Badge>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <Tooltip label="詳細表示">
                              <IconButton
                                aria-label="詳細表示"
                                icon={<FiEye />}
                                size="sm"
                                variant="ghost"
                                onClick={() => handleViewDetails(shift.id)}
                              />
                            </Tooltip>
                            {shift.status === 'pending' && (
                              <>
                                <Tooltip label="承認">
                                  <IconButton
                                    aria-label="承認"
                                    icon={<FiCheck />}
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="green"
                                    onClick={() => handleApproveShift(shift.id, shift.employeeName)}
                                  />
                                </Tooltip>
                                <Tooltip label="却下">
                                  <IconButton
                                    aria-label="却下"
                                    icon={<FiX />}
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="red"
                                    onClick={() => handleRejectShift(shift.id, shift.employeeName)}
                                  />
                                </Tooltip>
                              </>
                            )}
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  )
}

export default ShiftManagementPage