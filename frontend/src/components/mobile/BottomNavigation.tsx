import React from 'react'
import {
  Box,
  HStack,
  VStack,
  Text,
  Icon,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react'
import { 
  FiHome,
  FiCalendar,
  FiFileText,
  FiClock,
  FiMessageCircle,
} from 'react-icons/fi'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { ROUTES } from '../../types/index'

interface NavItem {
  label: string
  icon: any
  path: string
  badge?: number
}

const BottomNavigation: React.FC = () => {
  const { user } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const bg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  // スマホ用の主要なナビゲーション項目（最大5つ）
  const navItems: NavItem[] = user?.role === 'ADMIN' ? [
    {
      label: 'ホーム',
      icon: FiHome,
      path: '/admin',
    },
    {
      label: 'シフト',
      icon: FiCalendar,
      path: ROUTES.ADMIN.SHIFT_MANAGEMENT,
    },
    {
      label: '日報',
      icon: FiFileText,
      path: ROUTES.ADMIN.REPORT_MANAGEMENT,
    },
    {
      label: 'チャット',
      icon: FiMessageCircle,
      path: ROUTES.EMPLOYEE.CHAT,
      badge: 5,
    },
    {
      label: 'メニュー',
      icon: FiClock,
      path: '/menu', // メニューページへのリンク
    },
  ] : [
    {
      label: 'ホーム',
      icon: FiHome,
      path: '/employee',
    },
    {
      label: 'シフト',
      icon: FiCalendar,
      path: ROUTES.EMPLOYEE.SHIFT_REQUEST,
    },
    {
      label: '日報',
      icon: FiFileText,
      path: ROUTES.EMPLOYEE.DAILY_REPORT,
    },
    {
      label: '勤怠',
      icon: FiClock,
      path: ROUTES.EMPLOYEE.ATTENDANCE,
    },
    {
      label: 'チャット',
      icon: FiMessageCircle,
      path: ROUTES.EMPLOYEE.CHAT,
      badge: 5,
    },
  ]

  const handleNavigation = (path: string) => {
    navigate(path)
  }

  const isActivePath = (path: string): boolean => {
    if (path === '/employee' && location.pathname === '/dashboard') return true
    if (path === '/admin' && location.pathname === '/admin') return true
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <Box
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      bg={bg}
      borderTopWidth="1px"
      borderTopColor={borderColor}
      display={{ base: 'block', md: 'none' }}
      zIndex={20}
      boxShadow="0 -2px 8px rgba(0,0,0,0.1)"
      pb="env(safe-area-inset-bottom)"
    >
      <HStack spacing={0} justify="space-around" py={2}>
        {navItems.map((item, index) => {
          const isActive = isActivePath(item.path)
          
          return (
            <VStack
              key={index}
              as="button"
              spacing={1}
              flex={1}
              py={2}
              px={1}
              color={isActive ? 'primary.500' : 'gray.500'}
              onClick={() => handleNavigation(item.path)}
              cursor="pointer"
              _active={{ transform: 'scale(0.95)' }}
              transition="all 0.2s"
              position="relative"
            >
              <Box position="relative">
                <Icon as={item.icon} size="24px" />
                {item.badge && (
                  <Badge
                    colorScheme="red"
                    variant="solid"
                    borderRadius="full"
                    fontSize="10px"
                    position="absolute"
                    top="-8px"
                    right="-8px"
                    minW="18px"
                    h="18px"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Box>
              <Text
                fontSize="10px"
                fontWeight={isActive ? 'semibold' : 'medium'}
                noOfLines={1}
              >
                {item.label}
              </Text>
              {isActive && (
                <Box
                  w="4px"
                  h="4px"
                  borderRadius="full"
                  bg="primary.500"
                  position="absolute"
                  bottom="2px"
                />
              )}
            </VStack>
          )
        })}
      </HStack>
    </Box>
  )
}

export default BottomNavigation