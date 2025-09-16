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
  IconButton,
  Tooltip,
  useToast,
  Flex,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react'
import { FiEye, FiDownload, FiCheck, FiClock, FiImage } from 'react-icons/fi'

// ダミーデータ
const mockReports = [
  {
    id: '1',
    employeeName: '田中太郎',
    employeeId: 'emp001',
    date: '2024-09-16',
    workHours: 8,
    earnings: 12000,
    status: 'submitted',
    submittedAt: '2024-09-16T18:30:00Z',
    location: '東京営業所',
    photos: ['https://via.placeholder.com/300x200/4285f4/ffffff?text=Work+Photo+1'],
    comment: '今日は配送が順調で、予定より早く完了できました。'
  },
  {
    id: '2',
    employeeName: '佐藤花子',
    employeeId: 'emp002',
    date: '2024-09-16',
    workHours: 7.5,
    earnings: 11250,
    status: 'approved',
    submittedAt: '2024-09-16T17:45:00Z',
    location: '大阪営業所',
    photos: ['https://via.placeholder.com/300x200/34a853/ffffff?text=Work+Photo+2'],
    comment: '特に問題なく作業を完了しました。'
  },
  {
    id: '3',
    employeeName: '鈴木一郎',
    employeeId: 'emp003',
    date: '2024-09-15',
    workHours: 6,
    earnings: 9000,
    status: 'pending',
    submittedAt: '2024-09-15T16:20:00Z',
    location: '名古屋営業所',
    photos: [],
    comment: '遅れて提出申し訳ありません。'
  }
]

const ReportManagementPage = () => {
  const [reports, setReports] = useState(mockReports)
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  const handleViewReport = (report: any) => {
    setSelectedReport(report)
    onOpen()
  }

  const handleApproveReport = (id: string, employeeName: string) => {
    setReports(prev => prev.map(report =>
      report.id === id ? { ...report, status: 'approved' } : report
    ))
    toast({
      title: '日報を承認しました',
      description: `${employeeName}さんの日報を承認しました`,
      status: 'success',
      duration: 3000,
      isClosable: true
    })
  }

  const handleExportReports = () => {
    toast({
      title: 'レポート出力',
      description: 'レポート出力機能は開発中です',
      status: 'info',
      duration: 3000,
      isClosable: true
    })
  }

  const pendingReports = reports.filter(report => report.status === 'pending').length
  const approvedReports = reports.filter(report => report.status === 'approved').length
  const totalEarnings = reports.reduce((sum, report) => sum + report.earnings, 0)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'orange'
      case 'submitted': return 'blue'
      case 'approved': return 'green'
      default: return 'gray'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '確認待ち'
      case 'submitted': return '提出済み'
      case 'approved': return '承認済み'
      default: return '不明'
    }
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* ヘッダー */}
        <Flex justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Heading size="lg">📄 日報管理</Heading>
            <Text color="gray.600">従業員の日報確認と承認</Text>
          </VStack>
          <Button
            leftIcon={<FiDownload />}
            colorScheme="primary"
            onClick={handleExportReports}
          >
            レポート出力
          </Button>
        </Flex>

        {/* 統計カード */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>確認待ち</StatLabel>
                <StatNumber color="orange.500">{pendingReports}</StatNumber>
                <StatHelpText>要確認の日報</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>承認済み</StatLabel>
                <StatNumber color="green.500">{approvedReports}</StatNumber>
                <StatHelpText>今月承認分</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>総収益</StatLabel>
                <StatNumber>¥{totalEarnings.toLocaleString()}</StatNumber>
                <StatHelpText>今月の総額</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* 日報一覧 */}
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Heading size="md">日報一覧</Heading>
              
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>従業員</Th>
                    <Th>日付</Th>
                    <Th>勤務時間</Th>
                    <Th>収益</Th>
                    <Th>提出日時</Th>
                    <Th>写真</Th>
                    <Th>ステータス</Th>
                    <Th>操作</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {reports.map((report) => (
                    <Tr key={report.id}>
                      <Td>
                        <HStack>
                          <Avatar size="sm" name={report.employeeName} />
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="medium">{report.employeeName}</Text>
                            <Text fontSize="xs" color="gray.500">{report.employeeId}</Text>
                          </VStack>
                        </HStack>
                      </Td>
                      <Td>
                        <Text fontWeight="medium">
                          {new Date(report.date).toLocaleDateString('ja-JP')}
                        </Text>
                      </Td>
                      <Td>
                        <Text>{report.workHours}時間</Text>
                      </Td>
                      <Td>
                        <Text fontWeight="medium" color="green.500">
                          ¥{report.earnings.toLocaleString()}
                        </Text>
                      </Td>
                      <Td>
                        <Text fontSize="sm">
                          {new Date(report.submittedAt).toLocaleString('ja-JP')}
                        </Text>
                      </Td>
                      <Td>
                        <HStack>
                          {report.photos.length > 0 ? (
                            <Badge colorScheme="blue" leftIcon={<FiImage />}>
                              {report.photos.length}枚
                            </Badge>
                          ) : (
                            <Text fontSize="sm" color="gray.400">なし</Text>
                          )}
                        </HStack>
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={getStatusColor(report.status)}
                          variant="solid"
                        >
                          {getStatusText(report.status)}
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
                              onClick={() => handleViewReport(report)}
                            />
                          </Tooltip>
                          {(report.status === 'pending' || report.status === 'submitted') && (
                            <Tooltip label="承認">
                              <IconButton
                                aria-label="承認"
                                icon={<FiCheck />}
                                size="sm"
                                variant="ghost"
                                colorScheme="green"
                                onClick={() => handleApproveReport(report.id, report.employeeName)}
                              />
                            </Tooltip>
                          )}
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </VStack>
          </CardBody>
        </Card>

        {/* 日報詳細モーダル */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>日報詳細</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              {selectedReport && (
                <VStack spacing={4} align="stretch">
                  <HStack>
                    <Avatar size="md" name={selectedReport.employeeName} />
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="bold">{selectedReport.employeeName}</Text>
                      <Text fontSize="sm" color="gray.500">
                        {new Date(selectedReport.date).toLocaleDateString('ja-JP')}
                      </Text>
                    </VStack>
                  </HStack>
                  
                  <SimpleGrid columns={2} spacing={4}>
                    <Box>
                      <Text fontSize="sm" color="gray.500">勤務時間</Text>
                      <Text fontWeight="medium">{selectedReport.workHours}時間</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.500">収益</Text>
                      <Text fontWeight="medium" color="green.500">
                        ¥{selectedReport.earnings.toLocaleString()}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.500">勤務地</Text>
                      <Text fontWeight="medium">{selectedReport.location}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.500">提出日時</Text>
                      <Text fontWeight="medium">
                        {new Date(selectedReport.submittedAt).toLocaleString('ja-JP')}
                      </Text>
                    </Box>
                  </SimpleGrid>

                  {selectedReport.comment && (
                    <Box>
                      <Text fontSize="sm" color="gray.500" mb={2}>コメント</Text>
                      <Text p={3} bg="gray.50" borderRadius="md">{selectedReport.comment}</Text>
                    </Box>
                  )}

                  {selectedReport.photos.length > 0 && (
                    <Box>
                      <Text fontSize="sm" color="gray.500" mb={2}>添付写真</Text>
                      <HStack spacing={2}>
                        {selectedReport.photos.map((photo: string, index: number) => (
                          <Image
                            key={index}
                            src={photo}
                            alt={`作業写真${index + 1}`}
                            w="100px"
                            h="80px"
                            objectFit="cover"
                            borderRadius="md"
                            cursor="pointer"
                          />
                        ))}
                      </HStack>
                    </Box>
                  )}
                </VStack>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  )
}

export default ReportManagementPage