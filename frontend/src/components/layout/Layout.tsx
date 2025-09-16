import React, { useState } from 'react'
import { Box, Flex, useDisclosure } from '@chakra-ui/react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import BottomNavigation from '../mobile/BottomNavigation'
import MobileDrawer from '../mobile/MobileDrawer'
import { useAuthStore } from '../../store/authStore'

const Layout: React.FC = () => {
  const { user } = useAuthStore()
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <Flex minH="100vh" bg="gray.50">
        {/* デスクトップサイドバー - モバイルでは非表示 */}
        <Box display={{ base: 'none', md: 'block' }}>
          <Sidebar />
        </Box>
        
        {/* メインコンテンツエリア */}
        <Box 
          flex="1" 
          display="flex" 
          flexDirection="column"
          ml={{ base: 0, md: '280px' }}
          w={{ base: '100%', md: 'calc(100% - 280px)' }}
        >
          {/* ヘッダー - モバイル最適化 */}
          <Header onSidebarToggle={onOpen} />
          
          {/* ページコンテンツ - モバイルファースト */}
          <Box
            as="main"
            flex="1"
            p={{ base: 3, sm: 4, md: 6 }}
            pb={{ base: 24, md: 6 }} // モバイルでボトムナビゲーション分のスペースを確保
            pt={{ base: 2, md: 4 }}
            bg="gray.50"
            overflowY="auto"
            minH={{ base: 'calc(100vh - 60px)', md: 'calc(100vh - 80px)' }}
            maxW="100vw"
            overflowX="hidden"
          >
            {/* モバイルコンテンツラッパー */}
            <Box
              maxW={{ base: '100%', md: 'none' }}
              mx="auto"
              w="full"
            >
              <Outlet />
            </Box>
          </Box>
        </Box>
      </Flex>

      {/* モバイル専用コンポーネント */}
      <BottomNavigation />
      <MobileDrawer isOpen={isOpen} onClose={onClose} />
    </>
  )
}

export default Layout