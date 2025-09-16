import React, { useState, useEffect } from 'react'
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Avatar,
  Card,
  CardBody,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  IconButton,
  Tooltip,
  useToast,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import { FiUserPlus, FiEdit2, FiTrash2, FiMail, FiPhone } from 'react-icons/fi'

// ダミーデータ
const mockEmployees = [
  {
    id: '1',
    name: '田中太郎',
    email: 'tanaka@example.com',
    phone: '090-1234-5678',
    role: 'EMPLOYEE',
    isActive: true,
    joinDate: '2024-01-15',
    lastActive: '2024-09-16T06:30:00Z'
  },
  {
    id: '2',
    name: '佐藤花子',
    email: 'sato@example.com',
    phone: '090-2345-6789',
    role: 'EMPLOYEE',
    isActive: true,
    joinDate: '2024-02-20',
    lastActive: '2024-09-16T05:45:00Z'
  },
  {
    id: '3',
    name: '鈴木一郎',
    email: 'suzuki@example.com',
    phone: '090-3456-7890',
    role: 'EMPLOYEE',
    isActive: false,
    joinDate: '2024-01-10',
    lastActive: '2024-09-10T10:20:00Z'
  }
]

const EmployeeManagementPage = () => {
  const [employees, setEmployees] = useState(mockEmployees)
  const toast = useToast()

  const handleEditEmployee = (id: string) => {
    toast({
      title: '編集機能',
      description: `従業員ID: ${id} の編集機能は開発中です`,
      status: 'info',
      duration: 3000,
      isClosable: true
    })
  }

  const handleDeleteEmployee = (id: string, name: string) => {
    if (confirm(`${name}さんを削除してもよろしいですか？`)) {
      setEmployees(prev => prev.filter(emp => emp.id !== id))
      toast({
        title: '従業員を削除しました',
        description: `${name}さんのアカウントを削除しました`,
        status: 'success',
        duration: 3000,
        isClosable: true
      })
    }
  }

  const handleToggleStatus = (id: string, name: string, currentStatus: boolean) => {
    const action = currentStatus ? '無効化' : '有効化'
    if (confirm(`${name}さんのアカウントを${action}してもよろしいですか？`)) {
      setEmployees(prev => prev.map(emp => 
        emp.id === id ? { ...emp, isActive: !currentStatus } : emp
      ))
      toast({
        title: `アカウントを${action}しました`,
        description: `${name}さんのアカウントを${action}しました`,
        status: 'success',
        duration: 3000,
        isClosable: true
      })
    }
  }

  const handleAddEmployee = () => {
    toast({
      title: '従業員追加',
      description: '従業員追加機能は招待コード機能をご利用ください',
      status: 'info',
      duration: 3000,
      isClosable: true
    })
  }

  const activeEmployees = employees.filter(emp => emp.isActive).length
  const totalEmployees = employees.length

  return (
    <Box p={{ base: 3, md: 6 }}>
      <VStack spacing={{ base: 4, md: 6 }} align="stretch">
        {/* ヘッダー - モバイル最適化 */}
        <VStack spacing={{ base: 3, md: 1 }} align="stretch">
          <VStack align="start" spacing={1}>
            <Heading size={{ base: 'md', md: 'lg' }}>👥 従業員管理</Heading>
            <Text color="gray.600" fontSize={{ base: 'sm', md: 'md' }}>
              従業員アカウントの管理と統計
            </Text>
          </VStack>
          <Button
            leftIcon={<FiUserPlus />}
            colorScheme="primary"
            onClick={handleAddEmployee}
            size={{ base: 'sm', md: 'md' }}
            w={{ base: 'full', md: 'auto' }}
          >
            従業員を追加
          </Button>
        </VStack>

        {/* 統計カード - モバイル最適化 */}
        <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={{ base: 3, md: 4 }}>
          <Card>
            <CardBody p={{ base: 3, md: 6 }}>
              <Stat>
                <StatLabel fontSize={{ base: 'xs', md: 'sm' }}>総従業員数</StatLabel>
                <StatNumber fontSize={{ base: 'lg', md: '2xl' }}>{totalEmployees}</StatNumber>
                <StatHelpText fontSize={{ base: 'xs', md: 'sm' }}>登録済みアカウント</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody p={{ base: 3, md: 6 }}>
              <Stat>
                <StatLabel fontSize={{ base: 'xs', md: 'sm' }}>有効アカウント</StatLabel>
                <StatNumber color="green.500" fontSize={{ base: 'lg', md: '2xl' }}>{activeEmployees}</StatNumber>
                <StatHelpText fontSize={{ base: 'xs', md: 'sm' }}>アクティブな従業員</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody p={{ base: 3, md: 6 }}>
              <Stat>
                <StatLabel fontSize={{ base: 'xs', md: 'sm' }}>無効アカウント</StatLabel>
                <StatNumber color="red.500" fontSize={{ base: 'lg', md: '2xl' }}>{totalEmployees - activeEmployees}</StatNumber>
                <StatHelpText fontSize={{ base: 'xs', md: 'sm' }}>非アクティブ</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* 従業員一覧 - レスポンシブ対応 */}
        <Card>
          <CardBody p={{ base: 3, md: 6 }}>
            <VStack spacing={{ base: 3, md: 4 }} align="stretch">
              <Heading size={{ base: 'sm', md: 'md' }}>従業員一覧</Heading>
              
              {employees.length === 0 ? (
                <Alert status="info">
                  <AlertIcon />
                  <Text fontSize={{ base: 'sm', md: 'md' }}>
                    従業員が登録されていません。招待コードを発行して従業員を招待してください。
                  </Text>
                </Alert>
              ) : (
                <>
                  {/* モバイル用カードリスト */}
                  <Box display={{ base: 'block', md: 'none' }}>
                    <VStack spacing={3}>
                      {employees.map((employee) => (
                        <Card key={employee.id} w="full" size="sm">
                          <CardBody p={3}>
                            <VStack spacing={3} align="stretch">
                              <HStack justify="space-between" align="start">
                                <HStack spacing={3} flex={1}>
                                  <Avatar size="sm" name={employee.name} />
                                  <VStack align="start" spacing={0} flex={1}>
                                    <Text fontWeight="medium" fontSize="sm">{employee.name}</Text>
                                    <Text fontSize="xs" color="gray.500">ID: {employee.id}</Text>
                                  </VStack>
                                </HStack>
                                <Badge
                                  colorScheme={employee.isActive ? 'green' : 'red'}
                                  variant="solid"
                                  cursor="pointer"
                                  size="sm"
                                  onClick={() => handleToggleStatus(employee.id, employee.name, employee.isActive)}
                                >
                                  {employee.isActive ? '有効' : '無効'}
                                </Badge>
                              </HStack>
                              
                              <VStack spacing={2} align="stretch">
                                <VStack align="start" spacing={1}>
                                  <HStack spacing={2}>
                                    <FiMail size="12" />
                                    <Text fontSize="xs">{employee.email}</Text>
                                  </HStack>
                                  <HStack spacing={2}>
                                    <FiPhone size="12" />
                                    <Text fontSize="xs">{employee.phone}</Text>
                                  </HStack>
                                </VStack>
                                
                                <HStack justify="space-between" align="center">
                                  <VStack align="start" spacing={0}>
                                    <Text fontSize="xs" color="gray.600">
                                      入社: {new Date(employee.joinDate).toLocaleDateString('ja-JP')}
                                    </Text>
                                    <Text fontSize="xs" color="gray.600">
                                      最終: {new Date(employee.lastActive).toLocaleDateString('ja-JP')}
                                    </Text>
                                  </VStack>
                                  
                                  <HStack spacing={1}>
                                    <IconButton
                                      aria-label="編集"
                                      icon={<FiEdit2 />}
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleEditEmployee(employee.id)}
                                    />
                                    <IconButton
                                      aria-label="削除"
                                      icon={<FiTrash2 />}
                                      size="sm"
                                      variant="ghost"
                                      colorScheme="red"
                                      onClick={() => handleDeleteEmployee(employee.id, employee.name)}
                                    />
                                  </HStack>
                                </HStack>
                              </VStack>
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
                          <Th>連絡先</Th>
                          <Th>入社日</Th>
                          <Th>最終アクティブ</Th>
                          <Th>ステータス</Th>
                          <Th>操作</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {employees.map((employee) => (
                          <Tr key={employee.id}>
                            <Td>
                              <HStack>
                                <Avatar size="sm" name={employee.name} />
                                <VStack align="start" spacing={0}>
                                  <Text fontWeight="medium">{employee.name}</Text>
                                  <Text fontSize="xs" color="gray.500">ID: {employee.id}</Text>
                                </VStack>
                              </HStack>
                            </Td>
                            <Td>
                              <VStack align="start" spacing={1}>
                                <HStack>
                                  <FiMail size="12" />
                                  <Text fontSize="sm">{employee.email}</Text>
                                </HStack>
                                <HStack>
                                  <FiPhone size="12" />
                                  <Text fontSize="sm">{employee.phone}</Text>
                                </HStack>
                              </VStack>
                            </Td>
                            <Td>
                              <Text fontSize="sm">
                                {new Date(employee.joinDate).toLocaleDateString('ja-JP')}
                              </Text>
                            </Td>
                            <Td>
                              <Text fontSize="sm">
                                {new Date(employee.lastActive).toLocaleString('ja-JP')}
                              </Text>
                            </Td>
                            <Td>
                              <Badge
                                colorScheme={employee.isActive ? 'green' : 'red'}
                                variant="solid"
                                cursor="pointer"
                                onClick={() => handleToggleStatus(employee.id, employee.name, employee.isActive)}
                              >
                                {employee.isActive ? '有効' : '無効'}
                              </Badge>
                            </Td>
                            <Td>
                              <HStack spacing={2}>
                                <Tooltip label="編集">
                                  <IconButton
                                    aria-label="編集"
                                    icon={<FiEdit2 />}
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleEditEmployee(employee.id)}
                                  />
                                </Tooltip>
                                <Tooltip label="削除">
                                  <IconButton
                                    aria-label="削除"
                                    icon={<FiTrash2 />}
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="red"
                                    onClick={() => handleDeleteEmployee(employee.id, employee.name)}
                                  />
                                </Tooltip>
                              </HStack>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                </>
              )}
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  )
}

export default EmployeeManagementPage