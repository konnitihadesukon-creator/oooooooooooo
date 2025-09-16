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

  return (
    <Box
      as="header"
      bg={bg}
      borderBottomWidth="1px"
      borderBottomColor={borderColor}
      px={{ base: 4, md: 6 }}
      py={4}
      position="sticky"
      top={0}
      zIndex={10}
      boxShadow="sm"
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
            <Text fontSize="lg" fontWeight="bold" color="primary.500">
              シフトマッチ
            </Text>
            <Text fontSize="sm" color="gray.500">
              {user?.role === 'ADMIN' ? '管理者' : '従業員'}ダッシュボード
            </Text>
          </VStack>
        </HStack>

        {/* 右側：通知 + ユーザーメニュー */}
        <HStack spacing={4}>
          {/* 通知アイコン */}
          <Box position="relative">
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
          </Box>

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
              <MenuItem icon={<FiSettings />}>
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