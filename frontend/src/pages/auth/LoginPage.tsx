import React, { useState } from 'react'
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Link,
  Divider,
  IconButton,
  InputGroup,
  InputRightElement,
  useToast,
  Image,
  Center,
} from '@chakra-ui/react'
import { FiEye, FiEyeOff, FiKey, FiSmartphone } from 'react-icons/fi'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom'
import { LoginRequest, ROUTES } from '../../types'
import { useAuthStore } from '../../store/authStore'

// バリデーションスキーマ
const loginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(1, 'パスワードを入力してください'),
})

type LoginFormData = z.infer<typeof loginSchema>

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login, user } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  // 既にログイン済みの場合はリダイレクト
  React.useEffect(() => {
    if (user) {
      const redirectPath = user.role === 'ADMIN' ? '/admin' : '/employee'
      navigate(redirectPath, { replace: true })
    }
  }, [user, navigate])

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true)
      await login(data as LoginRequest)
      
      toast({
        title: 'ログイン成功',
        description: 'ダッシュボードに移動します',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      // リダイレクト先を決定
      const from = (location.state as any)?.from || '/dashboard'
      navigate(from, { replace: true })
      
    } catch (error: any) {
      toast({
        title: 'ログインエラー',
        description: error.response?.data?.message || 'ログインに失敗しました',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBiometricLogin = () => {
    toast({
      title: '生体認証',
      description: '生体認証機能は準備中です',
      status: 'info',
      duration: 3000,
      isClosable: true,
    })
  }

  const handleOtpLogin = () => {
    navigate('/otp-login')
  }

  return (
    <Flex 
      minH="100vh" 
      bg={{ base: "primary.500", lg: "gray.50" }}
      direction={{ base: "column", lg: "row" }}
    >
      {/* 左側：ブランディングエリア - デスクトップ表示 */}
      <Flex
        flex={1}
        bg="primary.500"
        color="white"
        p={{ base: 8, lg: 12 }}
        direction="column"
        justify="center"
        display={{ base: 'none', lg: 'flex' }}
      >
        <VStack align="start" spacing={8} maxW="md">
          <Box>
            <Text fontSize="5xl" fontWeight="bold" mb={4}>
              シフトマッチ
            </Text>
            <Text fontSize="xl" opacity={0.9}>
              軽貨物専用シフト管理アプリ
            </Text>
          </Box>
          
          <VStack align="start" spacing={4}>
            <HStack>
              <Box w={2} h={2} borderRadius="full" bg="white" />
              <Text>AIによる自動シフト作成</Text>
            </HStack>
            <HStack>
              <Box w={2} h={2} borderRadius="full" bg="white" />
              <Text>GPS勤怠管理機能</Text>
            </HStack>
            <HStack>
              <Box w={2} h={2} borderRadius="full" bg="white" />
              <Text>OCR対応日報システム</Text>
            </HStack>
            <HStack>
              <Box w={2} h={2} borderRadius="full" bg="white" />
              <Text>リアルタイムチャット機能</Text>
            </HStack>
          </VStack>
          
          {/* シフトくんキャラクター表示予定エリア */}
          <Center
            w="200px"
            h="200px"
            borderRadius="full"
            bg="whiteAlpha.200"
            mt={8}
          >
            <Text fontSize="6xl">🚚</Text>
          </Center>
        </VStack>
      </Flex>

      {/* モバイル用ヘッダー */}
      <Box 
        display={{ base: 'block', lg: 'none' }}
        color="white"
        p={6}
        textAlign="center"
      >
        <Text fontSize="6xl" mb={2}>🚚</Text>
        <Text fontSize="2xl" fontWeight="bold" mb={1}>
          シフトマッチ
        </Text>
        <Text fontSize="sm" opacity={0.9}>
          軽貨物専用シフト管理アプリ
        </Text>
      </Box>

      {/* ログインフォーム */}
      <Flex 
        flex={1} 
        justify="center" 
        align={{ base: "flex-start", lg: "center" }}
        p={{ base: 6, lg: 8 }}
        bg={{ base: "white", lg: "transparent" }}
        borderTopRadius={{ base: "2xl", lg: "none" }}
        mt={{ base: "auto", lg: 0 }}
      >
        <Box w="full" maxW="md">
          <Card 
            w="full" 
            boxShadow={{ base: "none", lg: "xl" }}
            bg={{ base: "transparent", lg: "white" }}
          >
            <CardBody p={{ base: 0, lg: 8 }}>
            <VStack spacing={6} align="stretch">
              {/* タイトル */}
              <VStack spacing={2}>
                <Text fontSize="3xl" fontWeight="bold" color="primary.500">
                  ログイン
                </Text>
                <Text color="gray.600" textAlign="center">
                  アカウントにサインインしてください
                </Text>
              </VStack>

              {/* ログインフォーム */}
              <form onSubmit={handleSubmit(onSubmit)}>
                <VStack spacing={4}>
                  <FormControl isInvalid={!!errors.email}>
                    <FormLabel>メールアドレス</FormLabel>
                    <Input
                      {...register('email')}
                      type="email"
                      placeholder="example@email.com"
                      size="lg"
                    />
                    <FormErrorMessage>
                      {errors.email?.message}
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.password}>
                    <FormLabel>パスワード</FormLabel>
                    <InputGroup size="lg">
                      <Input
                        {...register('password')}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="パスワードを入力"
                      />
                      <InputRightElement>
                        <IconButton
                          aria-label={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
                          icon={showPassword ? <FiEyeOff /> : <FiEye />}
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowPassword(!showPassword)}
                        />
                      </InputRightElement>
                    </InputGroup>
                    <FormErrorMessage>
                      {errors.password?.message}
                    </FormErrorMessage>
                  </FormControl>

                  <Button
                    type="submit"
                    size="lg"
                    w="full"
                    isLoading={isLoading}
                    loadingText="ログイン中..."
                  >
                    ログイン
                  </Button>
                </VStack>
              </form>

              {/* 代替ログイン方法 */}
              <VStack spacing={4}>
                <HStack w="full">
                  <Divider />
                  <Text fontSize="sm" color="gray.500" whiteSpace="nowrap">
                    または
                  </Text>
                  <Divider />
                </HStack>

                <HStack spacing={4} w="full">
                  <Button
                    leftIcon={<FiKey />}
                    variant="outline"
                    size="lg"
                    flex={1}
                    onClick={handleBiometricLogin}
                  >
                    生体認証
                  </Button>
                  <Button
                    leftIcon={<FiSmartphone />}
                    variant="outline"
                    size="lg"
                    flex={1}
                    onClick={handleOtpLogin}
                  >
                    OTP認証
                  </Button>
                </HStack>
              </VStack>

              {/* フッターリンク */}
              <VStack spacing={2}>
                <Link as={RouterLink} to="/forgot-password" color="primary.500">
                  パスワードをお忘れですか？
                </Link>
                <HStack>
                  <Text fontSize="sm" color="gray.600">
                    アカウントをお持ちでない方は
                  </Text>
                  <Link
                    as={RouterLink}
                    to={ROUTES.REGISTER}
                    color="primary.500"
                    fontWeight="semibold"
                  >
                    新規登録
                  </Link>
                </HStack>
              </VStack>
            </VStack>
          </CardBody>
        </Card>
      </Flex>
    </Flex>
  )
}

export default LoginPage