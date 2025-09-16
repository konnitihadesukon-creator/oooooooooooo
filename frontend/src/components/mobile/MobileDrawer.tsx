import React from 'react'
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  HStack,
  Text,
  Icon,
  Badge,
  Box,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react'
import { 
  FiHome,
  FiCalendar,
  FiFileText,
  FiClock,
  FiMessageCircle,
  FiUsers,
  FiSettings,
  FiBarChart,
  FiMapPin,
  FiUser,
} from 'react-icons/fi'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { ROUTES } from '../../types/index'

interface NavItem {
  label: string
  icon: any
  path: string
  badge?: number
  role?: 'ADMIN' | 'EMPLOYEE' | 'BOTH'
}

interface MobileDrawerProps {
  isOpen: boolean
  onClose: () => void
}

const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const { user } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  // 全ナビゲーション項目
  const navItems: NavItem[] = [
    // 共通項目
    {
      label: 'ダッシュボード',
      icon: FiHome,
      path: user?.role === 'ADMIN' ? '/admin' : '/employee',
      role: 'BOTH'
    },
    
    // 従業員専用項目
    {
      label: 'シフト希望提出',
      icon: FiCalendar,
      path: ROUTES.EMPLOYEE.SHIFT_REQUEST,
      role: 'EMPLOYEE'
    },
    {
      label: 'シフト確認',
      icon: FiCalendar,
      path: ROUTES.EMPLOYEE.SHIFT_VIEW,
      badge: 2,
      role: 'EMPLOYEE'
    },
    {
      label: '日報提出',
      icon: FiFileText,
      path: ROUTES.EMPLOYEE.DAILY_REPORT,
      role: 'EMPLOYEE'
    },
    {
      label: 'GPS勤怠',
      icon: FiClock,
      path: ROUTES.EMPLOYEE.ATTENDANCE,
      role: 'EMPLOYEE'
    },
    
    // 管理者専用項目
    {
      label: '従業員管理',
      icon: FiUsers,
      path: ROUTES.ADMIN.EMPLOYEE_MANAGEMENT,
      role: 'ADMIN'
    },
    {
      label: 'シフト管理',
      icon: FiCalendar,
      path: ROUTES.ADMIN.SHIFT_MANAGEMENT,
      role: 'ADMIN'
    },
    {
      label: '日報管理',
      icon: FiFileText,
      path: ROUTES.ADMIN.REPORT_MANAGEMENT,
      role: 'ADMIN'
    },
    {
      label: '営業所管理',
      icon: FiMapPin,
      path: ROUTES.ADMIN.LOCATION_MANAGEMENT,
      role: 'ADMIN'
    },
    {
      label: '分析・レポート',
      icon: FiBarChart,
      path: ROUTES.ADMIN.ANALYTICS,
      role: 'ADMIN'
    },
    
    // 共通項目（下部）
    {
      label: 'チャット',
      icon: FiMessageCircle,
      path: ROUTES.EMPLOYEE.CHAT,
      badge: 5,
      role: 'BOTH'
    },
    {
      label: 'プロフィール',
      icon: FiUser,
      path: user?.role === 'ADMIN' ? ROUTES.ADMIN.SETTINGS : ROUTES.EMPLOYEE.PROFILE,
      role: 'BOTH'
    },
  ]

  // 現在のユーザーロールに応じてフィルタリング
  const filteredNavItems = navItems.filter(item => 
    item.role === 'BOTH' || item.role === user?.role
  )

  const handleNavigation = (path: string) => {
    navigate(path)
    onClose()
  }

  const isActivePath = (path: string): boolean => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="sm">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">
          <HStack spacing={3}>
            <Box
              w={10}
              h={10}
              borderRadius="lg"
              bg="primary.500"
              display="flex"
              alignItems="center"
              justifyContent="center"
              color="white"
              fontWeight="bold"
            >
              シ
            </Box>
            <VStack align="start" spacing={0}>
              <Text fontSize="lg" fontWeight="bold" color="primary.500">
                シフトマッチ
              </Text>
              <Text fontSize="xs" color="gray.500">
                軽貨物専用シフト管理
              </Text>
            </VStack>
          </HStack>
        </DrawerHeader>

        <DrawerBody px={0}>
          <VStack spacing={0} align="stretch">
            {filteredNavItems.map((item, index) => {
              const isActive = isActivePath(item.path)
              
              return (
                <Box key={index}>
                  {/* 区切り線の挿入 */}
                  {(index === filteredNavItems.findIndex(i => i.role === 'ADMIN') ||
                    index === filteredNavItems.length - 2) && (
                    <Divider my={2} />
                  )}
                  
                  <HStack
                    as="button"
                    w="full"
                    px={6}
                    py={4}
                    bg={isActive ? 'primary.50' : 'transparent'}
                    color={isActive ? 'primary.600' : 'gray.600'}
                    fontWeight={isActive ? 'semibold' : 'medium'}
                    _active={{ bg: 'gray.100' }}
                    onClick={() => handleNavigation(item.path)}
                    cursor="pointer"
                    spacing={4}
                    justify="flex-start"
                  >
                    <Icon as={item.icon} size="20px" />
                    <Text flex={1} textAlign="left">
                      {item.label}
                    </Text>
                    {item.badge && (
                      <Badge
                        colorScheme="red"
                        variant="solid"
                        borderRadius="full"
                        fontSize="xs"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </HStack>
                </Box>
              )
            })}
          </VStack>

          {/* フッター（ユーザー情報） */}
          <Box 
            position="absolute" 
            bottom={0} 
            left={0} 
            right={0} 
            p={6} 
            borderTopWidth="1px" 
            borderTopColor={borderColor}
            bg="white"
          >
            <HStack spacing={3}>
              <Box
                w={10}
                h={10}
                borderRadius="full"
                bg={user?.role === 'ADMIN' ? 'accent.500' : 'secondary.500'}
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
                fontSize="sm"
                fontWeight="bold"
              >
                {user?.role === 'ADMIN' ? '管' : '従'}
              </Box>
              <VStack align="start" spacing={0} flex={1}>
                <Text fontSize="md" fontWeight="medium" noOfLines={1}>
                  {user?.name}
                </Text>
                <Text fontSize="sm" color="gray.500" noOfLines={1}>
                  {user?.role === 'ADMIN' ? '管理者' : '従業員'}
                </Text>
              </VStack>
            </HStack>
          </Box>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

export default MobileDrawer