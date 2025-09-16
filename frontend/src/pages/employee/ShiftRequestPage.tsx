import React from 'react'
import {
  Box,
  Heading,
  Text,
  Card,
  CardBody,
  VStack,
  Center,
} from '@chakra-ui/react'
import { FiCalendar } from 'react-icons/fi'

const ShiftRequestPage: React.FC = () => {
  return (
    <Box>
      <VStack align="start" spacing={4} mb={8}>
        <Heading size="lg">シフト希望提出</Heading>
        <Text color="gray.600">
          来月のシフト希望を提出してください
        </Text>
      </VStack>

      <Card>
        <CardBody>
          <Center py={20}>
            <VStack spacing={4}>
              <Box fontSize="6xl" color="gray.300">
                <FiCalendar />
              </Box>
              <Heading size="md" color="gray.500">
                シフト希望提出機能
              </Heading>
              <Text color="gray.400" textAlign="center" maxW="md">
                この機能は現在開発中です。<br />
                カレンダー形式でのシフト希望提出、期限管理、リマインダー機能などを実装予定です。
              </Text>
            </VStack>
          </Center>
        </CardBody>
      </Card>
    </Box>
  )
}

export default ShiftRequestPage