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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  Tooltip,
  useToast,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useDisclosure,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react'
import { FiMapPin, FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi'

// ダミーデータ
const mockLocations = [
  {
    id: '1',
    name: '東京営業所',
    address: '東京都港区赤坂1-1-1',
    phone: '03-1234-5678',
    manager: '田中部長',
    capacity: 20,
    currentStaff: 15,
    status: 'active',
    workingHours: '09:00-18:00'
  },
  {
    id: '2',
    name: '大阪営業所',
    address: '大阪府大阪市北区梅田2-2-2',
    phone: '06-2345-6789',
    manager: '佐藤課長',
    capacity: 15,
    currentStaff: 12,
    status: 'active',
    workingHours: '08:30-17:30'
  },
  {
    id: '3',
    name: '名古屋営業所',
    address: '愛知県名古屋市中区栄3-3-3',
    phone: '052-3456-7890',
    manager: '鈴木主任',
    capacity: 10,
    currentStaff: 8,
    status: 'maintenance',
    workingHours: '09:30-18:30'
  }
]

const LocationManagementPage = () => {
  const [locations, setLocations] = useState(mockLocations)
  const [selectedLocation, setSelectedLocation] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  const handleAddLocation = () => {
    setSelectedLocation({
      name: '',
      address: '',
      phone: '',
      manager: '',
      capacity: 0,
      workingHours: '09:00-18:00'
    })
    setIsEditing(true)
    onOpen()
  }

  const handleEditLocation = (location: any) => {
    setSelectedLocation(location)
    setIsEditing(true)
    onOpen()
  }

  const handleDeleteLocation = (id: string, name: string) => {
    if (confirm(`営業所「${name}」を削除してもよろしいですか？`)) {
      setLocations(prev => prev.filter(loc => loc.id !== id))
      toast({
        title: '営業所を削除しました',
        description: `「${name}」を削除しました`,
        status: 'success',
        duration: 3000,
        isClosable: true
      })
    }
  }

  const handleSaveLocation = () => {
    if (selectedLocation.id) {
      // 編集
      setLocations(prev => prev.map(loc =>
        loc.id === selectedLocation.id ? selectedLocation : loc
      ))
      toast({
        title: '営業所を更新しました',
        description: `「${selectedLocation.name}」の情報を更新しました`,
        status: 'success',
        duration: 3000,
        isClosable: true
      })
    } else {
      // 新規追加
      const newLocation = {
        ...selectedLocation,
        id: Date.now().toString(),
        currentStaff: 0,
        status: 'active'
      }
      setLocations(prev => [...prev, newLocation])
      toast({
        title: '営業所を追加しました',
        description: `「${selectedLocation.name}」を追加しました`,
        status: 'success',
        duration: 3000,
        isClosable: true
      })
    }
    onClose()
  }

  const handleToggleStatus = (id: string, name: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'maintenance' : 'active'
    const action = newStatus === 'active' ? '有効化' : 'メンテナンス'
    
    setLocations(prev => prev.map(loc =>
      loc.id === id ? { ...loc, status: newStatus } : loc
    ))
    toast({
      title: `営業所を${action}しました`,
      description: `「${name}」を${action}しました`,
      status: 'info',
      duration: 3000,
      isClosable: true
    })
  }

  const activeLocations = locations.filter(loc => loc.status === 'active').length
  const totalCapacity = locations.reduce((sum, loc) => sum + loc.capacity, 0)
  const totalStaff = locations.reduce((sum, loc) => sum + loc.currentStaff, 0)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green'
      case 'maintenance': return 'orange'
      case 'inactive': return 'red'
      default: return 'gray'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '稼働中'
      case 'maintenance': return 'メンテナンス'
      case 'inactive': return '停止中'
      default: return '不明'
    }
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* ヘッダー */}
        <Flex justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Heading size="lg">🏢 営業所管理</Heading>
            <Text color="gray.600">営業所の管理と設定</Text>
          </VStack>
          <Button
            leftIcon={<FiPlus />}
            colorScheme="primary"
            onClick={handleAddLocation}
          >
            営業所を追加
          </Button>
        </Flex>

        {/* 統計カード */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>稼働営業所</StatLabel>
                <StatNumber color="green.500">{activeLocations}</StatNumber>
                <StatHelpText>総{locations.length}拠点</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>総収容人数</StatLabel>
                <StatNumber>{totalCapacity}</StatNumber>
                <StatHelpText>全拠点合計</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>配置済み人数</StatLabel>
                <StatNumber color="blue.500">{totalStaff}</StatNumber>
                <StatHelpText>稼働率 {Math.round((totalStaff / totalCapacity) * 100)}%</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* 営業所一覧 */}
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Heading size="md">営業所一覧</Heading>
              
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>営業所名</Th>
                    <Th>所在地</Th>
                    <Th>管理者</Th>
                    <Th>人数</Th>
                    <Th>営業時間</Th>
                    <Th>ステータス</Th>
                    <Th>操作</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {locations.map((location) => (
                    <Tr key={location.id}>
                      <Td>
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium">{location.name}</Text>
                          <Text fontSize="xs" color="gray.500">{location.phone}</Text>
                        </VStack>
                      </Td>
                      <Td>
                        <Text fontSize="sm">{location.address}</Text>
                      </Td>
                      <Td>
                        <Text>{location.manager}</Text>
                      </Td>
                      <Td>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm">
                            {location.currentStaff}/{location.capacity}人
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            稼働率 {Math.round((location.currentStaff / location.capacity) * 100)}%
                          </Text>
                        </VStack>
                      </Td>
                      <Td>
                        <Text fontSize="sm">{location.workingHours}</Text>
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={getStatusColor(location.status)}
                          variant="solid"
                          cursor="pointer"
                          onClick={() => handleToggleStatus(location.id, location.name, location.status)}
                        >
                          {getStatusText(location.status)}
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
                              onClick={() => handleEditLocation(location)}
                            />
                          </Tooltip>
                          <Tooltip label="削除">
                            <IconButton
                              aria-label="削除"
                              icon={<FiTrash2 />}
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => handleDeleteLocation(location.id, location.name)}
                            />
                          </Tooltip>
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </VStack>
          </CardBody>
        </Card>

        {/* 営業所編集モーダル */}
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {selectedLocation?.id ? '営業所編集' : '営業所追加'}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {selectedLocation && (
                <VStack spacing={4}>
                  <FormControl>
                    <FormLabel>営業所名</FormLabel>
                    <Input
                      value={selectedLocation.name}
                      onChange={(e) => setSelectedLocation({
                        ...selectedLocation,
                        name: e.target.value
                      })}
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>住所</FormLabel>
                    <Textarea
                      value={selectedLocation.address}
                      onChange={(e) => setSelectedLocation({
                        ...selectedLocation,
                        address: e.target.value
                      })}
                    />
                  </FormControl>
                  
                  <SimpleGrid columns={2} spacing={4} w="full">
                    <FormControl>
                      <FormLabel>電話番号</FormLabel>
                      <Input
                        value={selectedLocation.phone}
                        onChange={(e) => setSelectedLocation({
                          ...selectedLocation,
                          phone: e.target.value
                        })}
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>管理者</FormLabel>
                      <Input
                        value={selectedLocation.manager}
                        onChange={(e) => setSelectedLocation({
                          ...selectedLocation,
                          manager: e.target.value
                        })}
                      />
                    </FormControl>
                  </SimpleGrid>
                  
                  <SimpleGrid columns={2} spacing={4} w="full">
                    <FormControl>
                      <FormLabel>収容人数</FormLabel>
                      <Input
                        type="number"
                        value={selectedLocation.capacity}
                        onChange={(e) => setSelectedLocation({
                          ...selectedLocation,
                          capacity: parseInt(e.target.value) || 0
                        })}
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>営業時間</FormLabel>
                      <Input
                        value={selectedLocation.workingHours}
                        onChange={(e) => setSelectedLocation({
                          ...selectedLocation,
                          workingHours: e.target.value
                        })}
                      />
                    </FormControl>
                  </SimpleGrid>
                </VStack>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                キャンセル
              </Button>
              <Button colorScheme="primary" onClick={handleSaveLocation}>
                保存
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  )
}

export default LocationManagementPage