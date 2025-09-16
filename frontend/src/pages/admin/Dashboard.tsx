import React, { useState, useEffect } from 'react'
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
  Button,
  useToast,
  IconButton,
  Tooltip,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  Code,
  Flex,
  Spacer,
  useClipboard,
} from '@chakra-ui/react'
import { FiUsers, FiCalendar, FiFileText, FiTrendingUp, FiPlus, FiTrash2, FiCopy, FiUserPlus } from 'react-icons/fi'
import { useAuthStore } from '../../store/authStore'
import { inviteService, InviteCode, InviteStatistics } from '../../services/inviteService'

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
  const toast = useToast()
  
  // 招待コード関連の状態
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([])
  const [inviteStats, setInviteStats] = useState<InviteStatistics>({ total: 0, used: 0, active: 0 })
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // 招待コードをクリップボードにコピー
  const { onCopy } = useClipboard('')

  // 招待コード一覧を取得
  const fetchInviteCodes = async () => {
    try {
      setIsLoading(true)
      const data = await inviteService.getInviteCodes()
      setInviteCodes(data.inviteCodes)
      setInviteStats(data.statistics)
    } catch (error: any) {
      toast({
        title: 'エラー',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 新しい招待コードを生成
  const generateNewInviteCode = async () => {
    try {
      setIsGenerating(true)
      await inviteService.generateInviteCode()
      await fetchInviteCodes() // リストを更新
      toast({
        title: '成功',
        description: '新しい招待コードを生成しました',
        status: 'success',
        duration: 3000,
        isClosable: true
      })
    } catch (error: any) {
      toast({
        title: 'エラー',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // 招待コードを無効化
  const revokeInviteCode = async (codeId: string, token: string) => {
    try {
      await inviteService.revokeInviteCode(codeId)
      await fetchInviteCodes() // リストを更新
      toast({
        title: '成功',
        description: `招待コード「${token}」を無効化しました`,
        status: 'success',
        duration: 3000,
        isClosable: true
      })
    } catch (error: any) {
      toast({
        title: 'エラー',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    }
  }

  // 招待コードをクリップボードにコピー
  const copyInviteCode = (token: string) => {
    navigator.clipboard.writeText(token)
    toast({
      title: 'コピーしました',
      description: `招待コード「${token}」をクリップボードにコピーしました`,
      status: 'info',
      duration: 2000,
      isClosable: true
    })
  }

  // コンポーネントマウント時に招待コードを取得
  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchInviteCodes()
    }
  }, [user])

  return (
    <Box>
      {/* ヘッダー - モバイル最適化 */}
      <VStack align="start" spacing={{ base: 2, md: 4 }} mb={{ base: 4, md: 8 }}>
        <Heading size={{ base: 'md', md: 'lg' }}>管理者ダッシュボード</Heading>
        <Text color="gray.600" fontSize={{ base: 'sm', md: 'md' }}>
          全体の状況と従業員のパフォーマンスを確認できます
        </Text>
      </VStack>

      <VStack spacing={{ base: 4, md: 6 }} align="stretch">
        {/* 統計カード - モバイル最適化 */}
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={{ base: 3, md: 6 }}>
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

        {/* メインコンテンツエリア - モバイルファースト */}
        <VStack spacing={{ base: 4, md: 6 }} align="stretch">
          <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={{ base: 4, md: 6 }}>
            {/* 左側：営業所別統計 */}
            <Card>
              <CardBody p={{ base: 3, md: 6 }}>
                <VStack spacing={{ base: 3, md: 4 }} align="stretch">
                  <Heading size={{ base: 'sm', md: 'md' }}>営業所別パフォーマンス</Heading>
                  <VStack spacing={{ base: 3, md: 4 }}>
                    {adminDashboardData.locationStats.map((location, index) => (
                      <Box key={index} w="full" p={{ base: 3, md: 4 }} borderRadius="lg" bg="gray.50">
                        <VStack spacing={{ base: 2, md: 3 }} align="stretch">
                          <HStack justify="space-between">
                            <Text fontWeight="bold" fontSize={{ base: 'sm', md: 'md' }}>{location.name}</Text>
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
                            <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.600">売上</Text>
                            <Text fontSize={{ base: 'xs', md: 'sm' }} fontWeight="medium">
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
              <CardBody p={{ base: 3, md: 6 }}>
                <VStack spacing={{ base: 3, md: 4 }} align="stretch">
                  <Heading size={{ base: 'sm', md: 'md' }}>従業員売上ランキング TOP5</Heading>
                  
                  {/* モバイル用リスト表示 */}
                  <Box display={{ base: 'block', md: 'none' }}>
                    <VStack spacing={3}>
                      {adminDashboardData.employeeRanking.map((employee, index) => (
                        <Box key={index} w="full" p={3} borderRadius="md" bg="gray.50">
                          <HStack justify="space-between" align="start">
                            <HStack spacing={3} flex={1}>
                              <VStack spacing={0}>
                                <Text fontSize="lg" fontWeight="bold" color="primary.500">
                                  {index + 1}
                                </Text>
                                <Text fontSize="xs">
                                  {index === 0 && '🏆'}
                                  {index === 1 && '🥈'}
                                  {index === 2 && '🥉'}
                                </Text>
                              </VStack>
                              <Avatar size="sm" name={employee.name} />
                              <VStack spacing={0} align="start" flex={1}>
                                <Text fontSize="sm" fontWeight="medium">{employee.name}</Text>
                                <Text fontSize="xs" color="gray.500">{employee.workingDays}日稼働</Text>
                              </VStack>
                            </HStack>
                            <VStack spacing={0} align="end">
                              <Text fontSize="sm" fontWeight="bold">
                                ¥{employee.sales.toLocaleString()}
                              </Text>
                              <Text fontSize="xs" color="gray.500">売上</Text>
                            </VStack>
                          </HStack>
                        </Box>
                      ))}
                    </VStack>
                  </Box>

                  {/* デスクトップ用テーブル表示 */}
                  <Box display={{ base: 'none', md: 'block' }}>
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
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          </Grid>

          {/* 招待コード管理セクション */}
          <Card>
            <CardBody p={{ base: 3, md: 6 }}>
              <VStack spacing={{ base: 4, md: 6 }} align="stretch">
                {/* ヘッダー - モバイル最適化 */}
                <VStack spacing={3} align="stretch">
                  <HStack spacing={3}>
                    <Box fontSize={{ base: 'lg', md: 'xl' }}>
                      <FiUserPlus />
                    </Box>
                    <Heading size={{ base: 'sm', md: 'md' }}>従業員招待コード管理</Heading>
                  </HStack>
                  <Button
                    leftIcon={<FiPlus />}
                    colorScheme="primary"
                    onClick={generateNewInviteCode}
                    isLoading={isGenerating}
                    loadingText="生成中..."
                    size={{ base: 'sm', md: 'md' }}
                    w={{ base: 'full', md: 'auto' }}
                  >
                    新しい招待コードを生成
                  </Button>
                </VStack>

                {/* 統計情報 - モバイル最適化 */}
                <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={{ base: 3, md: 4 }}>
                  <Card bg="blue.50" borderColor="blue.200" borderWidth="1px">
                    <CardBody p={{ base: 3, md: 6 }}>
                      <Stat>
                        <StatLabel color="blue.600" fontSize={{ base: 'xs', md: 'sm' }}>発行済み</StatLabel>
                        <StatNumber color="blue.700" fontSize={{ base: 'lg', md: '2xl' }}>{inviteStats.total}</StatNumber>
                        <StatHelpText color="blue.500" fontSize={{ base: 'xs', md: 'sm' }}>総コード数</StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>
                  
                  <Card bg="green.50" borderColor="green.200" borderWidth="1px">
                    <CardBody p={{ base: 3, md: 6 }}>
                      <Stat>
                        <StatLabel color="green.600" fontSize={{ base: 'xs', md: 'sm' }}>使用済み</StatLabel>
                        <StatNumber color="green.700" fontSize={{ base: 'lg', md: '2xl' }}>{inviteStats.used}</StatNumber>
                        <StatHelpText color="green.500" fontSize={{ base: 'xs', md: 'sm' }}>登録完了</StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>

                  <Card bg="orange.50" borderColor="orange.200" borderWidth="1px">
                    <CardBody p={{ base: 3, md: 6 }}>
                      <Stat>
                        <StatLabel color="orange.600" fontSize={{ base: 'xs', md: 'sm' }}>有効</StatLabel>
                        <StatNumber color="orange.700" fontSize={{ base: 'lg', md: '2xl' }}>{inviteStats.active}</StatNumber>
                        <StatHelpText color="orange.500" fontSize={{ base: 'xs', md: 'sm' }}>利用可能</StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>
              </SimpleGrid>

              <Divider />

                {/* 招待コード一覧 */}
                <VStack spacing={{ base: 3, md: 4 }} align="stretch">
                  <Heading size="sm" color="gray.600">有効な招待コード</Heading>
                
                {isLoading ? (
                  <Text>読み込み中...</Text>
                ) : inviteCodes.length === 0 ? (
                  <Alert status="info">
                    <AlertIcon />
                    <AlertTitle>招待コードがありません</AlertTitle>
                    <AlertDescription>
                      新しい従業員を招待するために招待コードを生成してください。
                    </AlertDescription>
                  </Alert>
                  ) : (
                    <>
                      {/* モバイル用カードリスト */}
                      <Box display={{ base: 'block', md: 'none' }}>
                        <VStack spacing={3}>
                          {inviteCodes.map((code) => (
                            <Card key={code.id} w="full" size="sm">
                              <CardBody p={3}>
                                <VStack spacing={3} align="stretch">
                                  <HStack justify="space-between" align="start">
                                    <VStack spacing={1} align="start" flex={1}>
                                      <HStack>
                                        <Code colorScheme="blue" fontSize="sm" fontWeight="bold">
                                          {code.token}
                                        </Code>
                                        <IconButton
                                          aria-label="コピー"
                                          icon={<FiCopy />}
                                          size="xs"
                                          variant="ghost"
                                          onClick={() => copyInviteCode(code.token)}
                                        />
                                      </HStack>
                                      <Badge
                                        colorScheme={code.used ? 'gray' : 'green'}
                                        variant="solid"
                                        size="sm"
                                      >
                                        {code.used ? '使用済み' : '有効'}
                                      </Badge>
                                    </VStack>
                                    {!code.used && (
                                      <IconButton
                                        aria-label="無効化"
                                        icon={<FiTrash2 />}
                                        size="sm"
                                        colorScheme="red"
                                        variant="ghost"
                                        onClick={() => revokeInviteCode(code.id, code.token)}
                                      />
                                    )}
                                  </HStack>
                                  <VStack spacing={1} align="start">
                                    <Text fontSize="xs" color="gray.600">
                                      作成: {new Date(code.createdAt).toLocaleDateString('ja-JP')}
                                    </Text>
                                    <Text fontSize="xs" color="gray.600">
                                      期限: {new Date(code.expiresAt).toLocaleDateString('ja-JP')}
                                    </Text>
                                  </VStack>
                                </VStack>
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
                              <Th>招待コード</Th>
                              <Th>作成日時</Th>
                              <Th>有効期限</Th>
                              <Th>状態</Th>
                              <Th>操作</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {inviteCodes.map((code) => (
                              <Tr key={code.id}>
                                <Td>
                                  <HStack>
                                    <Code colorScheme="blue" fontSize="lg" fontWeight="bold">
                                      {code.token}
                                    </Code>
                                    <Tooltip label="コピー">
                                      <IconButton
                                        aria-label="コピー"
                                        icon={<FiCopy />}
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => copyInviteCode(code.token)}
                                      />
                                    </Tooltip>
                                  </HStack>
                                </Td>
                                <Td>
                                  <Text fontSize="sm">
                                    {new Date(code.createdAt).toLocaleString('ja-JP')}
                                  </Text>
                                </Td>
                                <Td>
                                  <Text fontSize="sm">
                                    {new Date(code.expiresAt).toLocaleString('ja-JP')}
                                  </Text>
                                </Td>
                                <Td>
                                  <Badge
                                    colorScheme={code.used ? 'gray' : 'green'}
                                    variant="solid"
                                  >
                                    {code.used ? '使用済み' : '有効'}
                                  </Badge>
                                </Td>
                                <Td>
                                  {!code.used && (
                                    <Tooltip label="無効化">
                                      <IconButton
                                        aria-label="無効化"
                                        icon={<FiTrash2 />}
                                        size="sm"
                                        colorScheme="red"
                                        variant="ghost"
                                        onClick={() => revokeInviteCode(code.id, code.token)}
                                      />
                                    </Tooltip>
                                  )}
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </Box>
                    </>
                  )}
                </VStack>
              </VStack>
            </CardBody>
          </Card>

          {/* アラート・通知エリア - モバイル最適化 */}
          <Card bg="accent.50" borderColor="accent.200" borderWidth="1px">
            <CardBody p={{ base: 3, md: 6 }}>
              <VStack spacing={{ base: 3, md: 4 }} align="stretch">
                <HStack>
                  <Box fontSize={{ base: 'lg', md: '2xl' }}>⚠️</Box>
                  <Heading size={{ base: 'sm', md: 'md' }} color="accent.700">
                    要注意事項
                  </Heading>
                </HStack>
                <VStack spacing={{ base: 2, md: 2 }} align="stretch">
                  <HStack spacing={{ base: 2, md: 3 }}>
                    <Box w={2} h={2} borderRadius="full" bg="red.500" flexShrink={0} />
                    <Text fontSize={{ base: 'xs', md: 'sm' }}>
                      東京営業所で明日のシフトに2名の不足が発生しています
                    </Text>
                  </HStack>
                  <HStack spacing={{ base: 2, md: 3 }}>
                    <Box w={2} h={2} borderRadius="full" bg="yellow.500" flexShrink={0} />
                    <Text fontSize={{ base: 'xs', md: 'sm' }}>
                      5名の従業員が日報の提出が遅れています
                    </Text>
                  </HStack>
                  <HStack spacing={{ base: 2, md: 3 }}>
                    <Box w={2} h={2} borderRadius="full" bg="blue.500" flexShrink={0} />
                    <Text fontSize={{ base: 'xs', md: 'sm' }}>
                      来月のシフト希望提出期限が3日後です
                    </Text>
                  </HStack>
              </VStack>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </VStack>
    </Box>
  )
}

export default AdminDashboard