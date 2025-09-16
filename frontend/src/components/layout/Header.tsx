import React from 'react'
import {
  Box,
  Flex,
  Text,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Button,
  Badge,
  IconButton,
  useColorModeValue,
  HStack,
  VStack,
} from '@chakra-ui/react'
import { FiBell, FiSettings, FiLogOut, FiUser, FiMenu } from 'react-icons/fi'
import { useAuthStore } from '../../store/authStore'
import { useNavigate } from 'react-router-dom'

interface HeaderProps {
  onSidebarToggle?: () => void
}

const Header: React.FC<HeaderProps> = ({ onSidebarToggle }) => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const bg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleProfile = () => {
    const profilePath = user?.role === 'ADMIN' 
      ? '/admin/settings' 
      : '/employee/profile'
    navigate(profilePath)
  }

  const handleSettings = () => {
    const settingsPath = user?.role === 'ADMIN' 
      ? '/admin/settings' 
      : '/employee/profile'
    navigate(settingsPath)
  }

  return (
    <Box
      as="header"
      bg={bg}
      borderBottomWidth="1px"
      borderBottomColor={borderColor}
      px={{ base: 3, md: 6 }}
      py={{ base: 3, md: 4 }}
      position="sticky"
      top={0}
      zIndex={10}
      boxShadow="sm"
      h={{ base: '60px', md: '80px' }}
    >
      <Flex justify="space-between" align="center">
        {/* 左側：モバイルメニューボタン + タイトル */}
        <HStack spacing={4}>
          <IconButton
            aria-label="メニューを開く"
            icon={<FiMenu />}
            variant="ghost"
            display={{ base: 'flex', md: 'none' }}
            onClick={onSidebarToggle}
          />
          <VStack align="start" spacing={0}>
            <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="bold" color="primary.500">
              シフトマッチ
            </Text>
            <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.500" display={{ base: 'none', sm: 'block' }}>
              {user?.role === 'ADMIN' ? '管理者' : '従業員'}ダッシュボード
            </Text>
          </VStack>
        </HStack>

        {/* 右側：通知 + ユーザーメニュー */}
        <HStack spacing={{ base: 2, md: 4 }}>
          {/* 通知アイコン */}
          <Menu>
            <MenuButton as={Box} position="relative">
              <IconButton
                aria-label="通知"
                icon={<FiBell />}
                variant="ghost"
                size="lg"
              />
              <Badge
                colorScheme="red"
                variant="solid"
                fontSize="xs"
                position="absolute"
                top="-1"
                right="-1"
              >
                3
              </Badge>
            </MenuButton>
            <MenuList maxW="350px" p={0}>
              <Box p={4} borderBottomWidth="1px">
                <Text fontWeight="bold">通知</Text>
              </Box>
              <MenuItem p={4}>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" fontWeight="medium">新しいシフト申請</Text>
                  <Text fontSize="xs" color="gray.500">山田太郎さんから新しいシフト申請が届きました</Text>
                  <Text fontSize="xs" color="gray.400">2時間前</Text>
                </VStack>
              </MenuItem>
              <MenuItem p={4}>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" fontWeight="medium">日報提出期限</Text>
                  <Text fontSize="xs" color="gray.500">今日の日報の提出期限が近づいています</Text>
                  <Text fontSize="xs" color="gray.400">4時間前</Text>
                </VStack>
              </MenuItem>
              <MenuItem p={4}>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" fontWeight="medium">システムメンテナンス</Text>
                  <Text fontSize="xs" color="gray.500">明日23:00〜25:00にメンテナンスを行います</Text>
                  <Text fontSize="xs" color="gray.400">1日前</Text>
                </VStack>
              </MenuItem>
            </MenuList>
          </Menu>

          {/* ユーザーメニュー */}
          <Menu>
            <MenuButton>
              <HStack spacing={3} cursor="pointer">
                <VStack spacing={0} align="end" display={{ base: 'none', md: 'flex' }}>
                  <Text fontSize="sm" fontWeight="medium">
                    {user?.name}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {user?.email}
                  </Text>
                </VStack>
                <Avatar
                  size="sm"
                  name={user?.name}
                  src={user?.avatar}
                  bg="primary.500"
                />
              </HStack>
            </MenuButton>
            <MenuList>
              <MenuItem icon={<FiUser />} onClick={handleProfile}>
                プロフィール
              </MenuItem>
              <MenuItem icon={<FiSettings />} onClick={handleSettings}>
                設定
              </MenuItem>
              <MenuDivider />
              <MenuItem icon={<FiLogOut />} onClick={handleLogout}>
                ログアウト
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>
    </Box>
  )
}

export default Header