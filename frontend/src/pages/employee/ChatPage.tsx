import React, { useState, useEffect, useRef } from 'react'
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
  Container
} from '@chakra-ui/react'
import {
  FiSend,
  FiPlus,
  FiUsers,
  FiMoreVertical,
  FiPaperclip,
  FiPhone,
  FiVideo
} from 'react-icons/fi'
import { format, isToday, isYesterday } from 'date-fns'
import { ja } from 'date-fns/locale'

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
  participants: User[]
  lastMessage?: Message
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
  const { isOpen, onOpen, onClose } = useDisclosure()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const toast = useToast()

  // 現在のユーザー（デモ用）
  const currentUser: User = {
    id: 'current-user',
    name: '田中太郎',
    avatar: '',
    isOnline: true
  }

  // チャット一覧の読み込み
  useEffect(() => {
    loadChats()
  }, [])

  // メッセージの読み込み
  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.id)
    }
  }, [selectedChat])

  // メッセージ表示の自動スクロール
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadChats = async () => {
    setIsLoading(true)
    try {
      // TODO: APIからチャット一覧を取得
      setTimeout(() => {
        const mockChats: Chat[] = [
          {
            id: '1',
            name: '全体チャット',
            type: 'GROUP',
            participants: [
              { id: 'admin', name: '管理者', avatar: '', isOnline: true },
              { id: 'user1', name: '佐藤花子', avatar: '', isOnline: true },
              { id: 'user2', name: '鈴木一郎', avatar: '', isOnline: false },
              currentUser
            ],
            lastMessage: {
              id: 'msg1',
              senderId: 'admin',
              sender: { id: 'admin', name: '管理者' },
              content: '明日のシフトについて連絡があります',
              type: 'TEXT',
              createdAt: new Date().toISOString()
            },
            unreadCount: 2,
            updatedAt: new Date().toISOString()
          },
          {
            id: '2',
            type: 'DIRECT',
            participants: [
              { id: 'admin', name: '管理者', avatar: '', isOnline: true },
              currentUser
            ],
            lastMessage: {
              id: 'msg2',
              senderId: 'admin',
              sender: { id: 'admin', name: '管理者' },
              content: 'お疲れさまです',
              type: 'TEXT',
              createdAt: new Date(Date.now() - 60000).toISOString()
            },
            unreadCount: 0,
            updatedAt: new Date(Date.now() - 60000).toISOString()
          }
        ]
        setChats(mockChats)
        setSelectedChat(mockChats[0])
        setIsLoading(false)
      }, 500)
    } catch (error) {
      console.error('チャット読み込みエラー:', error)
      setIsLoading(false)
    }
  }

  const loadMessages = async (chatId: string) => {
    try {
      // TODO: APIからメッセージを取得
      const mockMessages: Message[] = [
        {
          id: '1',
          senderId: 'admin',
          sender: { id: 'admin', name: '管理者', avatar: '' },
          content: 'おはようございます！今日も1日よろしくお願いします。',
          type: 'TEXT',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          readBy: ['current-user']
        },
        {
          id: '2',
          senderId: 'user1',
          sender: { id: 'user1', name: '佐藤花子', avatar: '' },
          content: 'おはようございます！',
          type: 'TEXT',
          createdAt: new Date(Date.now() - 3000000).toISOString(),
          readBy: ['current-user']
        },
        {
          id: '3',
          senderId: 'current-user',
          sender: currentUser,
          content: 'おはようございます！今日もよろしくお願いします。',
          type: 'TEXT',
          createdAt: new Date(Date.now() - 1800000).toISOString(),
          readBy: ['admin', 'user1']
        },
        {
          id: '4',
          senderId: 'admin',
          sender: { id: 'admin', name: '管理者', avatar: '' },
          content: '明日のシフトについて連絡があります。詳細は後ほど共有します。',
          type: 'TEXT',
          createdAt: new Date(Date.now() - 300000).toISOString()
        }
      ]
      setMessages(mockMessages)
    } catch (error) {
      console.error('メッセージ読み込みエラー:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || isSending) return

    setIsSending(true)
    try {
      const message: Message = {
        id: Date.now().toString(),
        senderId: currentUser.id,
        sender: currentUser,
        content: newMessage.trim(),
        type: 'TEXT',
        createdAt: new Date().toISOString()
      }

      // TODO: APIにメッセージを送信

      setMessages(prev => [...prev, message])
      setNewMessage('')
      
      // チャットリストの最新メッセージを更新
      setChats(prev => prev.map(chat => 
        chat.id === selectedChat.id 
          ? { ...chat, lastMessage: message, updatedAt: new Date().toISOString() }
          : chat
      ))

      setIsSending(false)
    } catch (error) {
      console.error('メッセージ送信エラー:', error)
      setIsSending(false)
      toast({
        title: 'エラー',
        description: 'メッセージの送信に失敗しました',
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
      const otherParticipant = chat.participants.find(p => p.id !== currentUser.id)
      return otherParticipant?.name || 'ダイレクトメッセージ'
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
    <Container maxW="container.xl" p={0}>
      <Flex h="calc(100vh - 120px)" bg="white" borderRadius="lg" overflow="hidden" boxShadow="sm">
        {/* チャット一覧 */}
        <Box w="300px" borderRight="1px" borderColor="gray.200" bg="gray.50">
          <VStack spacing={0} align="stretch">
            {/* ヘッダー */}
            <HStack p={4} borderBottom="1px" borderColor="gray.200" bg="white">
              <Text fontWeight="bold" fontSize="lg">チャット</Text>
              <IconButton
                ml="auto"
                icon={<FiPlus />}
                size="sm"
                onClick={onOpen}
                aria-label="新しいチャット"
              />
            </HStack>

            {/* チャット一覧 */}
            <Box flex={1} overflowY="auto">
              {chats.map(chat => (
                <Box
                  key={chat.id}
                  p={3}
                  cursor="pointer"
                  bg={selectedChat?.id === chat.id ? 'blue.50' : 'transparent'}
                  borderLeft={selectedChat?.id === chat.id ? '3px solid' : '3px solid transparent'}
                  borderColor="blue.500"
                  _hover={{ bg: 'gray.100' }}
                  onClick={() => setSelectedChat(chat)}
                >
                  <HStack spacing={3} align="start">
                    <Avatar size="sm" name={getChatDisplayName(chat)} />
                    <VStack flex={1} align="start" spacing={1}>
                      <HStack w="full" justify="space-between">
                        <Text fontWeight="medium" fontSize="sm" noOfLines={1}>
                          {getChatDisplayName(chat)}
                        </Text>
                        {chat.unreadCount && chat.unreadCount > 0 && (
                          <Badge colorScheme="red" borderRadius="full" fontSize="xs">
                            {chat.unreadCount}
                          </Badge>
                        )}
                      </HStack>
                      {chat.lastMessage && (
                        <Text fontSize="xs" color="gray.600" noOfLines={1}>
                          {chat.lastMessage.content}
                        </Text>
                      )}
                      <Text fontSize="xs" color="gray.400">
                        {formatMessageTime(chat.updatedAt)}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              ))}
            </Box>
          </VStack>
        </Box>

        {/* メッセージエリア */}
        <Flex flex={1} direction="column">
          {selectedChat ? (
            <>
              {/* チャットヘッダー */}
              <HStack p={4} borderBottom="1px" borderColor="gray.200" bg="white">
                <Avatar size="sm" name={getChatDisplayName(selectedChat)} />
                <VStack align="start" spacing={0} flex={1}>
                  <Text fontWeight="bold">{getChatDisplayName(selectedChat)}</Text>
                  {selectedChat.type === 'GROUP' && (
                    <Text fontSize="xs" color="gray.500">
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

              {/* メッセージ一覧 */}
              <Box flex={1} overflowY="auto" p={4}>
                <VStack spacing={4} align="stretch">
                  {messages.map((message, index) => {
                    const isOwn = message.senderId === currentUser.id
                    const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId
                    const showTime = index === messages.length - 1 || 
                                   messages[index + 1].senderId !== message.senderId ||
                                   new Date(messages[index + 1].createdAt).getTime() - new Date(message.createdAt).getTime() > 300000

                    return (
                      <HStack
                        key={message.id}
                        align="end"
                        justify={isOwn ? 'flex-end' : 'flex-start'}
                        spacing={2}
                      >
                        {!isOwn && (
                          <Avatar
                            size="sm"
                            name={message.sender.name}
                            src={message.sender.avatar}
                            visibility={showAvatar ? 'visible' : 'hidden'}
                          />
                        )}
                        
                        <VStack align={isOwn ? 'flex-end' : 'flex-start'} spacing={1} maxW="70%">
                          {!isOwn && showAvatar && (
                            <Text fontSize="xs" color="gray.500" ml={2}>
                              {message.sender.name}
                            </Text>
                          )}
                          
                          <Box
                            bg={isOwn ? 'blue.500' : 'gray.100'}
                            color={isOwn ? 'white' : 'black'}
                            px={3}
                            py={2}
                            borderRadius="lg"
                            borderBottomLeftRadius={isOwn ? 'lg' : showTime ? 'sm' : 'lg'}
                            borderBottomRightRadius={isOwn ? (showTime ? 'sm' : 'lg') : 'lg'}
                          >
                            <Text fontSize="sm" whiteSpace="pre-wrap">
                              {message.content}
                            </Text>
                          </Box>
                          
                          {showTime && (
                            <Text fontSize="xs" color="gray.400">
                              {formatMessageTime(message.createdAt)}
                            </Text>
                          )}
                        </VStack>
                      </HStack>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </VStack>
              </Box>

              {/* メッセージ入力 */}
              <HStack p={4} borderTop="1px" borderColor="gray.200" bg="white">
                <IconButton
                  icon={<FiPaperclip />}
                  variant="ghost"
                  size="sm"
                  aria-label="ファイル添付"
                />
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="メッセージを入力..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                />
                <IconButton
                  icon={<FiSend />}
                  colorScheme="blue"
                  isLoading={isSending}
                  onClick={sendMessage}
                  isDisabled={!newMessage.trim()}
                  aria-label="送信"
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
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>新しいチャット</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <Button w="full" leftIcon={<FiUsers />}>
                グループチャット作成
              </Button>
              <Text color="gray.500">または</Text>
              <Text fontSize="sm" color="gray.600">
                個人チャットを開始するにはメンバー一覧から選択してください
              </Text>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  )
}

export default ChatPage