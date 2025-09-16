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
  Input,
  Textarea,
  FormControl,
  FormLabel,
  FormErrorMessage,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  useToast,
  Image,
  SimpleGrid,
  Badge,
  Spinner,
  Center,
  Flex
} from '@chakra-ui/react'
import { 
  FiSave, 
  FiCamera, 
  FiPlus, 
  FiTrash2, 
  FiCalendar,
  FiMapPin,
  FiDollarSign
} from 'react-icons/fi'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface PieceRateItem {
  id: string
  name: string
  unitPrice: number
  quantity: number
  total: number
}

interface DailyReport {
  id?: string
  date: string
  locationId: string
  paymentType: 'DAILY_RATE' | 'PIECE_RATE'
  dailyAmount?: number
  pieceRateItems?: PieceRateItem[]
  totalAmount: number
  photos: string[]
  notes: string
  submittedAt?: string
}

interface Location {
  id: string
  name: string
  address: string
}

const DailyReportPage: React.FC = () => {
  const [report, setReport] = useState<DailyReport>({
    date: format(new Date(), 'yyyy-MM-dd'),
    locationId: '',
    paymentType: 'DAILY_RATE',
    totalAmount: 0,
    photos: [],
    notes: ''
  })
  const [locations, setLocations] = useState<Location[]>([])
  const [pieceRateItems, setPieceRateItems] = useState<PieceRateItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const toast = useToast()

  // 勤務地一覧の読み込み
  useEffect(() => {
    loadLocations()
    loadTodayReport()
  }, [])

  // 単価制アイテムの合計計算
  useEffect(() => {
    if (report.paymentType === 'PIECE_RATE') {
      const total = pieceRateItems.reduce((sum, item) => sum + item.total, 0)
      setReport(prev => ({ ...prev, totalAmount: total }))
    }
  }, [pieceRateItems, report.paymentType])

  const loadLocations = async () => {
    try {
      // TODO: APIから勤務地一覧を取得
      setTimeout(() => {
        setLocations([
          { id: '1', name: '東京営業所', address: '東京都千代田区...' },
          { id: '2', name: '横浜配送センター', address: '神奈川県横浜市...' },
          { id: '3', name: '埼玉物流センター', address: '埼玉県さいたま市...' }
        ])
      }, 500)
    } catch (error) {
      console.error('勤務地読み込みエラー:', error)
    }
  }

  const loadTodayReport = async () => {
    setIsLoading(true)
    try {
      // TODO: APIから本日の日報を取得
      setTimeout(() => {
        setIsLoading(false)
        // 既存の日報があれば設定
      }, 500)
    } catch (error) {
      console.error('日報読み込みエラー:', error)
      setIsLoading(false)
    }
  }

  // 単価制アイテム追加
  const addPieceRateItem = () => {
    const newItem: PieceRateItem = {
      id: Date.now().toString(),
      name: '',
      unitPrice: 0,
      quantity: 0,
      total: 0
    }
    setPieceRateItems(prev => [...prev, newItem])
  }

  // 単価制アイテム削除
  const removePieceRateItem = (id: string) => {
    setPieceRateItems(prev => prev.filter(item => item.id !== id))
  }

  // 単価制アイテム更新
  const updatePieceRateItem = (id: string, field: keyof PieceRateItem, value: any) => {
    setPieceRateItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value }
        // 合計を再計算
        if (field === 'unitPrice' || field === 'quantity') {
          updated.total = updated.unitPrice * updated.quantity
        }
        return updated
      }
      return item
    }))
  }

  // 写真ファイル選択
  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setPhotoFiles(prev => [...prev, ...files])
    
    // プレビュー用URL生成
    const newUrls = files.map(file => URL.createObjectURL(file))
    setReport(prev => ({
      ...prev,
      photos: [...prev.photos, ...newUrls]
    }))
  }

  // 写真削除
  const removePhoto = (index: number) => {
    setReport(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }))
    setPhotoFiles(prev => prev.filter((_, i) => i !== index))
  }

  // 保存処理
  const saveReport = async () => {
    // バリデーション
    if (!report.date || !report.locationId) {
      toast({
        title: 'エラー',
        description: '日付と勤務地を選択してください',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
      return
    }

    if (report.paymentType === 'DAILY_RATE' && !report.dailyAmount) {
      toast({
        title: 'エラー',
        description: '日当金額を入力してください',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
      return
    }

    if (report.paymentType === 'PIECE_RATE' && pieceRateItems.length === 0) {
      toast({
        title: 'エラー',
        description: '単価制の場合は作業項目を追加してください',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
      return
    }

    setIsSaving(true)
    try {
      // TODO: 写真のアップロード処理
      const uploadedPhotos: string[] = []

      const reportData = {
        ...report,
        pieceRateItems: report.paymentType === 'PIECE_RATE' ? pieceRateItems : undefined,
        photos: uploadedPhotos
      }

      // TODO: APIに送信
      console.log('Saving report:', reportData)

      setTimeout(() => {
        setIsSaving(false)
        toast({
          title: '保存完了',
          description: '日報を保存しました',
          status: 'success',
          duration: 3000,
          isClosable: true
        })
      }, 1000)
    } catch (error) {
      console.error('保存エラー:', error)
      setIsSaving(false)
      toast({
        title: 'エラー',
        description: '日報の保存に失敗しました',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
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
        <Heading size="lg">日報提出</Heading>
        <Text color="gray.600">
          本日の作業内容を報告してください
        </Text>
      </VStack>

      {/* 基本情報 */}
      <Card mb={6}>
        <CardBody>
          <VStack spacing={4}>
            <Heading size="md" alignSelf="start">基本情報</Heading>
            
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
              <FormControl>
                <FormLabel>作業日</FormLabel>
                <Input
                  type="date"
                  value={report.date}
                  onChange={(e) => setReport(prev => ({ ...prev, date: e.target.value }))}
                  icon={<FiCalendar />}
                />
              </FormControl>

              <FormControl>
                <FormLabel>勤務地</FormLabel>
                <Select
                  value={report.locationId}
                  onChange={(e) => setReport(prev => ({ ...prev, locationId: e.target.value }))}
                  placeholder="勤務地を選択"
                >
                  {locations.map(location => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </SimpleGrid>
          </VStack>
        </CardBody>
      </Card>

      {/* 支払いタイプ */}
      <Card mb={6}>
        <CardBody>
          <VStack spacing={4} align="start">
            <Heading size="md">支払い方式</Heading>
            
            <HStack spacing={4}>
              <Button
                variant={report.paymentType === 'DAILY_RATE' ? 'solid' : 'outline'}
                colorScheme="blue"
                onClick={() => {
                  setReport(prev => ({ ...prev, paymentType: 'DAILY_RATE' }))
                  setPieceRateItems([])
                }}
              >
                日当制
              </Button>
              <Button
                variant={report.paymentType === 'PIECE_RATE' ? 'solid' : 'outline'}
                colorScheme="green"
                onClick={() => {
                  setReport(prev => ({ ...prev, paymentType: 'PIECE_RATE', dailyAmount: undefined }))
                }}
              >
                単価制
              </Button>
            </HStack>

            {/* 日当制の場合 */}
            {report.paymentType === 'DAILY_RATE' && (
              <FormControl maxW="300px">
                <FormLabel>日当金額</FormLabel>
                <NumberInput
                  value={report.dailyAmount || 0}
                  onChange={(_, value) => setReport(prev => ({ 
                    ...prev, 
                    dailyAmount: value,
                    totalAmount: value
                  }))}
                  min={0}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            )}

            {/* 単価制の場合 */}
            {report.paymentType === 'PIECE_RATE' && (
              <Box w="full">
                <HStack justify="space-between" mb={4}>
                  <Text fontWeight="medium">作業項目</Text>
                  <Button
                    size="sm"
                    leftIcon={<FiPlus />}
                    onClick={addPieceRateItem}
                    colorScheme="green"
                  >
                    項目追加
                  </Button>
                </HStack>

                {pieceRateItems.length > 0 && (
                  <Box overflowX="auto">
                    <Table size="sm">
                      <Thead>
                        <Tr>
                          <Th>作業内容</Th>
                          <Th>単価</Th>
                          <Th>数量</Th>
                          <Th>小計</Th>
                          <Th width="60px"></Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {pieceRateItems.map(item => (
                          <Tr key={item.id}>
                            <Td>
                              <Input
                                size="sm"
                                value={item.name}
                                onChange={(e) => updatePieceRateItem(item.id, 'name', e.target.value)}
                                placeholder="作業内容"
                              />
                            </Td>
                            <Td>
                              <NumberInput
                                size="sm"
                                value={item.unitPrice}
                                onChange={(_, value) => updatePieceRateItem(item.id, 'unitPrice', value)}
                                min={0}
                              >
                                <NumberInputField />
                              </NumberInput>
                            </Td>
                            <Td>
                              <NumberInput
                                size="sm"
                                value={item.quantity}
                                onChange={(_, value) => updatePieceRateItem(item.id, 'quantity', value)}
                                min={0}
                              >
                                <NumberInputField />
                              </NumberInput>
                            </Td>
                            <Td>
                              <Text fontWeight="medium">¥{item.total.toLocaleString()}</Text>
                            </Td>
                            <Td>
                              <IconButton
                                size="sm"
                                icon={<FiTrash2 />}
                                onClick={() => removePieceRateItem(item.id)}
                                colorScheme="red"
                                variant="ghost"
                                aria-label="削除"
                              />
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                )}

                {pieceRateItems.length > 0 && (
                  <Flex justify="flex-end" mt={4}>
                    <Badge colorScheme="green" fontSize="md" p={2}>
                      合計: ¥{report.totalAmount.toLocaleString()}
                    </Badge>
                  </Flex>
                )}
              </Box>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* 写真添付 */}
      <Card mb={6}>
        <CardBody>
          <VStack spacing={4} align="start">
            <Heading size="md">写真添付</Heading>
            
            <Input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoSelect}
              display="none"
              id="photo-upload"
            />
            
            <Button
              as="label"
              htmlFor="photo-upload"
              leftIcon={<FiCamera />}
              cursor="pointer"
            >
              写真を追加
            </Button>

            {report.photos.length > 0 && (
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} w="full">
                {report.photos.map((photo, index) => (
                  <Box key={index} position="relative">
                    <Image
                      src={photo}
                      alt={`添付写真${index + 1}`}
                      borderRadius="md"
                      objectFit="cover"
                      w="full"
                      h="120px"
                    />
                    <IconButton
                      position="absolute"
                      top={2}
                      right={2}
                      size="sm"
                      icon={<FiTrash2 />}
                      onClick={() => removePhoto(index)}
                      colorScheme="red"
                      aria-label="写真を削除"
                    />
                  </Box>
                ))}
              </SimpleGrid>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* 備考 */}
      <Card mb={6}>
        <CardBody>
          <VStack spacing={4} align="start">
            <Heading size="md">備考</Heading>
            <Textarea
              value={report.notes}
              onChange={(e) => setReport(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="特記事項やコメントがあれば記入してください"
              rows={4}
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
          onClick={saveReport}
          isLoading={isSaving}
          loadingText="保存中..."
        >
          日報を提出
        </Button>
      </HStack>
    </Box>
  )
}

export default DailyReportPage