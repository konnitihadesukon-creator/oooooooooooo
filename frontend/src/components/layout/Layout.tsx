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
        {/* デスクトップサイドバー */}
        <Sidebar />
        
        {/* メインコンテンツエリア */}
        <Box 
          flex="1" 
          display="flex" 
          flexDirection="column"
          ml={{ base: 0, md: '280px' }}
        >
          {/* ヘッダー */}
          <Header onSidebarToggle={onOpen} />
          
          {/* ページコンテンツ */}
          <Box
            as="main"
            flex="1"
            p={{ base: 4, md: 6 }}
            pb={{ base: 20, md: 6 }} // モバイルでボトムナビゲーション分のスペースを確保
            bg="gray.50"
            overflowY="auto"
            minH="calc(100vh - 80px)" // ヘッダー分を引いた高さ
          >
            <Outlet />
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