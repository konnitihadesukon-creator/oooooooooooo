import React from 'react'
import { Box, Flex } from '@chakra-ui/react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import { useAuthStore } from '../../store/authStore'

const Layout: React.FC = () => {
  const { user } = useAuthStore()

  return (
    <Flex minH="100vh" bg="gray.50">
      {/* サイドバー */}
      <Sidebar />
      
      {/* メインコンテンツエリア */}
      <Box flex="1" display="flex" flexDirection="column">
        {/* ヘッダー */}
        <Header />
        
        {/* ページコンテンツ */}
        <Box
          as="main"
          flex="1"
          p={{ base: 4, md: 6 }}
          bg="gray.50"
          overflowY="auto"
        >
          <Outlet />
        </Box>
      </Box>
    </Flex>
  )
}

export default Layout