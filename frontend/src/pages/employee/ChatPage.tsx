import React, { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Avatar,
  Badge,
  Card,
  CardBody,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Spinner,
  Center,
  Divider,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Container,
  Select,
  FormControl,
  FormLabel,
  Textarea
} from '@chakra-ui/react'
import {
  FiSend,
  FiPlus,
  FiUsers,
  FiMoreVertical,
  FiPaperclip,
  FiPhone,
  FiVideo,
  FiArrowLeft
} from 'react-icons/fi'
import { format, isToday, isYesterday } from 'date-fns'
import { ja } from 'date-fns/locale'
import { useAuthStore } from '../../store/authStore'
import { api } from '../../utils/api'

interface User {
  id: string
  name: string
  avatar?: string
  isOnline?: boolean
}

interface Message {
  id: string
  senderId: string
  sender: User
  content: string
  type: 'TEXT' | 'IMAGE' | 'FILE'
  attachments?: string[]
  createdAt: string
  readBy?: string[]
}

interface Chat {
  id: string
  name?: string
  type: 'GROUP' | 'DIRECT'
  participants: {
    user: User
  }[]
  messages?: Message[]
  unreadCount?: number
  updatedAt: string
}

const ChatPage: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [chatName, setChatName] = useState('')
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isOnline, setIsOnline] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const toast = useToast()
  const { user } = useAuthStore()

  // Socket.IO接続とチャット一覧の読み込み
  useEffect(() => {
    loadChats()
    loadUsers()
    initializeSocket()

    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [])

  // Socket.IO初期化
  const initializeSocket = () => {
    if (!user?.id) {
      console.log('User not found, skipping socket initialization')
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      console.log('Token not found, skipping socket initialization')
      return
    }

    // API URLの取得 - フロントエンドが3000ポートの場合、バックエンドを3001ポートと推定
    const apiUrl = import.meta.env.VITE_API_URL || window.location.protocol + '//' + window.location.hostname + ':3001'
    console.log('Connecting to Socket.IO server:', apiUrl)

    const newSocket = io(apiUrl, {
      auth: {
        userId: user.id,
        token
      },
      transports: ['websocket', 'polling']
    })

    newSocket.on('connect', () => {
      console.log('✅ Socket.IO接続完了')
      setIsOnline(true)
    })

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket.IO接続エラー:', error)
      setIsOnline(false)
    })

    newSocket.on('disconnect', (reason) => {
      console.log('🔌 Socket.IO切断:', reason)
      setIsOnline(false)
    })

    newSocket.on('error', (error) => {
      console.error('🚨 Socket.IOエラー:', error)
      toast({
        title: '接続エラー',
        description: error.message || 'サーバーとの接続に問題があります',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    })

    newSocket.on('message-received', (data) => {
      const { chatId, message } = data
      if (selectedChat?.id === chatId) {
        setMessages(prev => [...prev, message])
      }
      // チャット一覧を更新
      setChats(prev => prev.map(chat => 
        chat.id === chatId 
          ? { ...chat, messages: [message], updatedAt: message.createdAt }
          : chat
      ))
      
      // 新しいメッセージの通知
      if (selectedChat?.id !== chatId) {
        toast({
          title: '新しいメッセージ',
          description: `${message.sender.name}さんからメッセージが届きました`,
          status: 'info',
          duration: 3000,
          isClosable: true,
          position: 'top'
        })
      }
    })

    newSocket.on('user-online', (userId) => {
      // オンラインユーザーの処理
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, isOnline: true } : u
      ))
    })

    newSocket.on('user-offline', (userId) => {
      // オフラインユーザーの処理
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, isOnline: false } : u
      ))
    })

    setSocket(newSocket)
  }

  // メッセージの読み込み
  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.id)
      // チャットルームに参加
      if (socket && selectedChat.id) {
        socket.emit('join-chat', selectedChat.id)
      }
    }
  }, [selectedChat, socket])

  // メッセージ表示の自動スクロール
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadChats = async () => {
    setIsLoading(true)
    try {
      const response = await api.get('/chat')
      if (response.data.success) {
        setChats(response.data.data.chats)
        if (response.data.data.chats.length > 0) {
          setSelectedChat(response.data.data.chats[0])
        }
      }
    } catch (error) {
      console.error('チャット読み込みエラー:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const response = await api.get('/users')
      if (response.data.success) {
        setUsers(response.data.data.users.filter((u: User) => u.id !== user?.id))
      }
    } catch (error) {
      console.error('ユーザー一覧取得エラー:', error)
    }
  }

  const loadMessages = async (chatId: string) => {
    try {
      const response = await api.get(`/chat/${chatId}/messages`)
      if (response.data.success) {
        setMessages(response.data.data.messages)
      }
    } catch (error) {
      console.error('メッセージ読み込みエラー:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || isSending) return

    setIsSending(true)
    try {
      const response = await api.post(`/chat/${selectedChat.id}/messages`, {
        content: newMessage.trim(),
        type: 'TEXT'
      })

      if (response.data.success) {
        setMessages(prev => [...prev, response.data.data.message])
        setNewMessage('')
        
        // チャットリストの最新メッセージを更新
        setChats(prev => prev.map(chat => 
          chat.id === selectedChat.id 
            ? { ...chat, messages: [response.data.data.message], updatedAt: new Date().toISOString() }
            : chat
        ))
      }
    } catch (error: any) {
      console.error('メッセージ送信エラー:', error)
      toast({
        title: 'エラー',
        description: error.response?.data?.error || 'メッセージの送信に失敗しました',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    } finally {
      setIsSending(false)
    }
  }

  const createChat = async () => {
    if (selectedUsers.length === 0) {
      toast({
        title: 'エラー',
        description: '参加者を選択してください',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
      return
    }

    try {
      const chatData = {
        name: chatName || undefined,
        type: selectedUsers.length === 1 ? 'DIRECT' : 'GROUP',
        participantIds: selectedUsers
      }

      const response = await api.post('/chat', chatData)
      
      if (response.data.success) {
        toast({
          title: 'チャットを作成しました',
          status: 'success',
          duration: 2000,
          isClosable: true
        })
        await loadChats()
        onClose()
        setChatName('')
        setSelectedUsers([])
      }
    } catch (error: any) {
      console.error('チャット作成エラー:', error)
      toast({
        title: 'エラー',
        description: error.response?.data?.error || 'チャットの作成に失敗しました',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString)
    if (isToday(date)) {
      return format(date, 'HH:mm')
    } else if (isYesterday(date)) {
      return '昨日 ' + format(date, 'HH:mm')
    } else {
      return format(date, 'M/d HH:mm', { locale: ja })
    }
  }

  const getChatDisplayName = (chat: Chat) => {
    if (chat.name) return chat.name
    if (chat.type === 'DIRECT') {
      const otherParticipant = chat.participants.find(p => p.user.id !== user?.id)
      return otherParticipant?.user.name || 'ダイレクトメッセージ'
    }
    return 'グループチャット'
  }

  if (isLoading) {
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
    <Box h={{ base: 'calc(100vh - 60px)', md: 'calc(100vh - 120px)' }} bg="white" overflow="hidden">
      <Flex h="full" direction={{ base: 'column', md: 'row' }}>
        {/* チャット一覧 - モバイル最適化 */}
        <Box 
          w={{ base: 'full', md: '300px' }} 
          h={{ base: selectedChat ? '0' : 'full', md: 'full' }}
          display={{ base: selectedChat ? 'none' : 'block', md: 'block' }}
          borderRight={{ base: 'none', md: '1px' }} 
          borderColor="gray.200" 
          bg="gray.50"
          overflow="hidden"
        >
          <VStack spacing={0} align="stretch" h="full">
            {/* ヘッダー - モバイル最適化 */}
            <HStack p={{ base: 3, md: 4 }} borderBottom="1px" borderColor="gray.200" bg="white">
              <Text fontWeight="bold" fontSize={{ base: 'md', md: 'lg' }}>チャット</Text>
              <IconButton
                ml="auto"
                icon={<FiPlus />}
                size={{ base: 'sm', md: 'sm' }}
                onClick={onOpen}
                aria-label="新しいチャット"
              />
            </HStack>

            {/* チャット一覧 - モバイル最適化 */}
            <Box flex={1} overflowY="auto">
              {chats.length === 0 ? (
                <Center p={{ base: 3, md: 4 }}>
                  <VStack spacing={2}>
                    <Text color="gray.500" fontSize={{ base: 'xs', md: 'sm' }}>チャットがありません</Text>
                    <Button size="xs" colorScheme="blue" onClick={onOpen}>
                      チャットを作成
                    </Button>
                  </VStack>
                </Center>
              ) : (
                chats.map(chat => (
                  <Box
                    key={chat.id}
                    p={{ base: 2, md: 3 }}
                    cursor="pointer"
                    bg={selectedChat?.id === chat.id ? 'blue.50' : 'transparent'}
                    borderLeft={selectedChat?.id === chat.id ? '3px solid' : '3px solid transparent'}
                    borderColor="blue.500"
                    _hover={{ bg: 'gray.100' }}
                    _active={{ bg: 'gray.200' }}
                    onClick={() => setSelectedChat(chat)}
                    minH={{ base: '60px', md: 'auto' }}
                    transition="all 0.2s"
                  >
                    <HStack spacing={{ base: 2, md: 3 }} align="start">
                      <Avatar size={{ base: 'xs', md: 'sm' }} name={getChatDisplayName(chat)} />
                      <VStack flex={1} align="start" spacing={1}>
                        <HStack w="full" justify="space-between">
                          <Text fontWeight="medium" fontSize={{ base: 'xs', md: 'sm' }} noOfLines={1}>
                            {getChatDisplayName(chat)}
                          </Text>
                          {chat.unreadCount && chat.unreadCount > 0 && (
                            <Badge colorScheme="red" borderRadius="full" fontSize="xs" size="sm">
                              {chat.unreadCount}
                            </Badge>
                          )}
                        </HStack>
                        {chat.messages && chat.messages.length > 0 && (
                          <Text fontSize={{ base: '2xs', md: 'xs' }} color="gray.600" noOfLines={1}>
                            {chat.messages[0].content}
                          </Text>
                        )}
                        <Text fontSize={{ base: '2xs', md: 'xs' }} color="gray.400">
                          {formatMessageTime(chat.updatedAt)}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                ))
              )}
            </Box>
          </VStack>
        </Box>

        {/* メッセージエリア - モバイル最適化 */}
        <Flex 
          flex={1} 
          direction="column" 
          display={{ base: selectedChat ? 'flex' : 'none', md: 'flex' }}
          h={{ base: selectedChat ? 'full' : '0', md: 'full' }}
        >
          {selectedChat ? (
            <>
              {/* チャットヘッダー - モバイル最適化 */}
              <HStack p={{ base: 3, md: 4 }} borderBottom="1px" borderColor="gray.200" bg="white">
                <IconButton
                  icon={<FiArrowLeft />}
                  variant="ghost"
                  size="sm"
                  display={{ base: 'flex', md: 'none' }}
                  onClick={() => setSelectedChat(null)}
                  aria-label="戻る"
                />
                <Box position="relative">
                  <Avatar size={{ base: 'sm', md: 'sm' }} name={getChatDisplayName(selectedChat)} />
                  {/* オンラインインジケーター */}
                  <Box
                    position="absolute"
                    bottom="0"
                    right="0"
                    w={3}
                    h={3}
                    bg={isOnline ? 'green.400' : 'gray.400'}
                    borderRadius="full"
                    border="2px solid white"
                  />
                </Box>
                <VStack align="start" spacing={0} flex={1}>
                  <HStack spacing={2}>
                    <Text fontWeight="bold" fontSize={{ base: 'sm', md: 'md' }}>
                      {getChatDisplayName(selectedChat)}
                    </Text>
                    {isOnline && (
                      <Badge colorScheme="green" size="sm" fontSize="2xs">
                        オンライン
                      </Badge>
                    )}
                  </HStack>
                  {selectedChat.type === 'GROUP' && (
                    <Text fontSize={{ base: '2xs', md: 'xs' }} color="gray.500">
                      {selectedChat.participants.length}名のメンバー
                    </Text>
                  )}
                </VStack>
                <Menu>
                  <MenuButton
                    as={IconButton}
                    icon={<FiMoreVertical />}
                    variant="ghost"
                    size="sm"
                    aria-label="メニュー"
                  />
                  <MenuList>
                    <MenuItem icon={<FiPhone />}>音声通話</MenuItem>
                    <MenuItem icon={<FiVideo />}>ビデオ通話</MenuItem>
                    <MenuItem icon={<FiUsers />}>メンバー表示</MenuItem>
                  </MenuList>
                </Menu>
              </HStack>

              {/* メッセージ一覧 - モバイル最適化 */}
              <Box flex={1} overflowY="auto" p={{ base: 2, md: 4 }}>
                {messages.length === 0 ? (
                  <Center h="200px">
                    <VStack spacing={2}>
                      <Text color="gray.500" fontSize={{ base: 'sm', md: 'md' }}>
                        メッセージがありません
                      </Text>
                      <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.400">
                        最初のメッセージを送信してみましょう！
                      </Text>
                    </VStack>
                  </Center>
                ) : (
                  <VStack spacing={{ base: 2, md: 4 }} align="stretch">
                    {messages.map((message, index) => {
                      const isOwn = message.senderId === user?.id
                      const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId
                      const showTime = index === messages.length - 1 || 
                                     messages[index + 1].senderId !== message.senderId ||
                                     new Date(messages[index + 1].createdAt).getTime() - new Date(message.createdAt).getTime() > 300000

                      return (
                        <HStack
                          key={message.id}
                          align="end"
                          justify={isOwn ? 'flex-end' : 'flex-start'}
                          spacing={{ base: 1, md: 2 }}
                        >
                          {!isOwn && (
                            <Avatar
                              size={{ base: 'xs', md: 'sm' }}
                              name={message.sender.name}
                              src={message.sender.avatar}
                              visibility={showAvatar ? 'visible' : 'hidden'}
                            />
                          )}
                          
                          <VStack 
                            align={isOwn ? 'flex-end' : 'flex-start'} 
                            spacing={1} 
                            maxW={{ base: '85%', md: '70%' }}
                          >
                            {!isOwn && showAvatar && (
                              <Text fontSize={{ base: '2xs', md: 'xs' }} color="gray.500" ml={2}>
                                {message.sender.name}
                              </Text>
                            )}
                            
                            <Box
                              bg={isOwn ? 'blue.500' : 'gray.100'}
                              color={isOwn ? 'white' : 'black'}
                              px={{ base: 2, md: 3 }}
                              py={{ base: 1.5, md: 2 }}
                              borderRadius="lg"
                              borderBottomLeftRadius={isOwn ? 'lg' : showTime ? 'sm' : 'lg'}
                              borderBottomRightRadius={isOwn ? (showTime ? 'sm' : 'lg') : 'lg'}
                              wordBreak="break-word"
                            >
                              <Text fontSize={{ base: 'xs', md: 'sm' }} whiteSpace="pre-wrap">
                                {message.content}
                              </Text>
                            </Box>
                            
                            {showTime && (
                              <Text fontSize={{ base: '2xs', md: 'xs' }} color="gray.400">
                                {formatMessageTime(message.createdAt)}
                              </Text>
                            )}
                          </VStack>
                        </HStack>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </VStack>
                )}
              </Box>

              {/* メッセージ入力 - モバイル最適化 */}
              <HStack 
                p={{ base: 2, md: 4 }} 
                borderTop="1px" 
                borderColor="gray.200" 
                bg="white"
                spacing={{ base: 2, md: 3 }}
              >
                <IconButton
                  icon={<FiPaperclip />}
                  variant="ghost"
                  size="sm"
                  aria-label="ファイル添付"
                  display={{ base: 'none', md: 'flex' }}
                />
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="メッセージを入力..."
                  size={{ base: 'sm', md: 'md' }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                  _focus={{
                    borderColor: 'blue.500',
                    boxShadow: '0 0 0 1px #3182CE'
                  }}
                />
                <IconButton
                  icon={<FiSend />}
                  colorScheme="blue"
                  isLoading={isSending}
                  onClick={sendMessage}
                  isDisabled={!newMessage.trim()}
                  aria-label="送信"
                  size={{ base: 'sm', md: 'md' }}
                />
              </HStack>
            </>
          ) : (
            <Center flex={1}>
              <VStack spacing={4}>
                <Text fontSize="xl" color="gray.400">
                  チャットを選択してください
                </Text>
              </VStack>
            </Center>
          )}
        </Flex>
      </Flex>

      {/* 新しいチャット作成モーダル */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>新しいチャット</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel fontSize="sm">参加者を選択</FormLabel>
                <Select
                  placeholder="ユーザーを選択..."
                  onChange={(e) => {
                    if (e.target.value && !selectedUsers.includes(e.target.value)) {
                      setSelectedUsers([...selectedUsers, e.target.value])
                    }
                  }}
                >
                  {users.filter(u => !selectedUsers.includes(u.id)).map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {selectedUsers.length > 0 && (
                <Box w="full">
                  <Text fontSize="sm" mb={2}>選択されたユーザー:</Text>
                  <VStack spacing={2}>
                    {selectedUsers.map(userId => {
                      const selectedUser = users.find(u => u.id === userId)
                      return (
                        <HStack key={userId} w="full" justify="space-between" p={2} bg="gray.50" borderRadius="md">
                          <Text fontSize="sm">{selectedUser?.name}</Text>
                          <Button
                            size="xs"
                            variant="ghost"
                            onClick={() => setSelectedUsers(selectedUsers.filter(id => id !== userId))}
                          >
                            削除
                          </Button>
                        </HStack>
                      )
                    })}
                  </VStack>
                </Box>
              )}

              {selectedUsers.length > 1 && (
                <FormControl>
                  <FormLabel fontSize="sm">グループ名（省略可）</FormLabel>
                  <Input
                    value={chatName}
                    onChange={(e) => setChatName(e.target.value)}
                    placeholder="グループ名を入力..."
                    size="sm"
                  />
                </FormControl>
              )}

              <HStack w="full" spacing={3}>
                <Button variant="ghost" onClick={onClose} flex={1}>
                  キャンセル
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={createChat}
                  isDisabled={selectedUsers.length === 0}
                  flex={1}
                >
                  作成
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  )
}

export default ChatPage