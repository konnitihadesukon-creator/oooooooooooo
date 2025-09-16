import React, { useState, useEffect } from 'react'
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
  useToast,
  Select,
  Alert,
  AlertIcon,
  Badge,
  Code,
  IconButton,
  Tooltip,
  Divider,
  Collapse,
  useDisclosure,
} from '@chakra-ui/react'
import { FiEye, FiEyeOff, FiCopy, FiRefreshCw } from 'react-icons/fi'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { RegisterRequest, ROUTES } from '../../types/index'
import { authService } from '../../services/authService'
import { inviteService } from '../../services/inviteService'

const registerSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string()
    .min(8, 'パスワードは8文字以上である必要があります')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'パスワードには大文字、小文字、数字、記号を含めてください'
    ),
  confirmPassword: z.string(),
  name: z.string().min(1, '名前を入力してください'),
  role: z.enum(['ADMIN', 'EMPLOYEE'], {
    required_error: 'ロールを選択してください',
    invalid_type_error: 'ロールを選択してください'
  }),
  invitationCode: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'パスワードが一致しません',
  path: ['confirmPassword'],
})

type RegisterFormData = z.infer<typeof registerSchema>

const RegisterPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [availableInviteCodes, setAvailableInviteCodes] = useState<{ token: string; expiresAt: string; createdAt: string }[]>([])
  const [isLoadingCodes, setIsLoadingCodes] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()
  const { isOpen: isCodesVisible, onToggle: toggleCodesVisible } = useDisclosure()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'ADMIN'
    }
  })

  // 利用可能な招待コードを取得
  const fetchAvailableInviteCodes = async () => {
    try {
      setIsLoadingCodes(true)
      const codes = await inviteService.getPublicInviteCodes()
      setAvailableInviteCodes(codes)
    } catch (error: any) {
      console.error('招待コード取得エラー:', error)
      // エラーがあっても登録画面の表示は続ける
    } finally {
      setIsLoadingCodes(false)
    }
  }

  // 招待コードをクリップボードにコピー
  const copyInviteCode = (token: string) => {
    navigator.clipboard.writeText(token)
    toast({
      title: 'コピーしました',
      description: `招待コード「${token}」をクリップボードにコピーしました`,
      status: 'success',
      duration: 2000,
      isClosable: true
    })
  }

  // 招待コードを入力フィールドにセット
  const selectInviteCode = (token: string) => {
    setValue('invitationCode', token)
    toast({
      title: '招待コードを選択',
      description: `招待コード「${token}」を入力フィールドにセットしました`,
      status: 'info',
      duration: 2000,
      isClosable: true
    })
  }

  // 従業員ロールが選択された時に招待コードを取得
  useEffect(() => {
    if (watch('role') === 'EMPLOYEE') {
      fetchAvailableInviteCodes()
    }
  }, [watch('role')])

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true)
      
      const registerData: RegisterRequest = {
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role,
        invitationToken: data.invitationCode,
      }
      
      await authService.register(registerData)
      
      toast({
        title: '登録完了',
        description: 'アカウントが作成されました。ログインページに移動します。',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
      
      navigate(ROUTES.LOGIN)
      
    } catch (error: any) {
      toast({
        title: '登録エラー',
        description: error.response?.data?.message || 'アカウント作成に失敗しました',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Flex minH="100vh" bg="gray.50" justify="center" align="center" p={8}>
      <Card w="full" maxW="md" boxShadow="xl">
        <CardBody p={8}>
          <VStack spacing={6} align="stretch">
            <VStack spacing={2}>
              <Text fontSize="3xl" fontWeight="bold" color="primary.500">
                新規登録
              </Text>
              <Text color="gray.600" textAlign="center">
                シフトマッチのアカウントを作成
              </Text>
            </VStack>

            <form onSubmit={handleSubmit(onSubmit)}>
              <VStack spacing={4}>
                <FormControl isInvalid={!!errors.name}>
                  <FormLabel>名前</FormLabel>
                  <Input
                    {...register('name')}
                    placeholder="山田 太郎"
                    size="lg"
                  />
                  <FormErrorMessage>
                    {errors.name?.message}
                  </FormErrorMessage>
                </FormControl>

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

                <FormControl isInvalid={!!errors.role}>
                  <FormLabel>登録タイプ</FormLabel>
                  <Select
                    {...register('role')}
                    size="lg"
                    placeholder="登録タイプを選択してください"
                  >
                    <option value="ADMIN">管理者（新しい組織を作成）</option>
                    <option value="EMPLOYEE">従業員（既存組織に参加）</option>
                  </Select>
                  <FormErrorMessage>
                    {errors.role?.message}
                  </FormErrorMessage>
                </FormControl>

                {watch('role') === 'ADMIN' && (
                  <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    <Text fontSize="sm">
                      管理者として登録すると、新しい組織が作成され、あなたがその組織の管理者になります。
                    </Text>
                  </Alert>
                )}

                {watch('role') === 'EMPLOYEE' && (
                  <Alert status="warning" borderRadius="md">
                    <AlertIcon />
                    <Text fontSize="sm">
                      従業員として登録するには、既存の組織が必要です。管理者が作成した組織に参加することになります。
                    </Text>
                  </Alert>
                )}

                <FormControl isInvalid={!!errors.password}>
                  <FormLabel>パスワード</FormLabel>
                  <Input
                    {...register('password')}
                    type="password"
                    placeholder="パスワードを入力"
                    size="lg"
                  />
                  <FormErrorMessage>
                    {errors.password?.message}
                  </FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.confirmPassword}>
                  <FormLabel>パスワード確認</FormLabel>
                  <Input
                    {...register('confirmPassword')}
                    type="password"
                    placeholder="パスワードを再入力"
                    size="lg"
                  />
                  <FormErrorMessage>
                    {errors.confirmPassword?.message}
                  </FormErrorMessage>
                </FormControl>

                {watch('role') === 'EMPLOYEE' && (
                  <VStack spacing={4} align="stretch">
                    <FormControl isInvalid={!!errors.invitationCode}>
                      <FormLabel>招待コード（任意）</FormLabel>
                      <Input
                        {...register('invitationCode')}
                        placeholder="招待コードがある場合は入力"
                        size="lg"
                      />
                      <FormErrorMessage>
                        {errors.invitationCode?.message}
                      </FormErrorMessage>
                    </FormControl>

                    {/* 利用可能な招待コード表示 */}
                    <Box>
                      <HStack justify="space-between" mb={2}>
                        <Text fontSize="sm" fontWeight="medium" color="gray.700">
                          利用可能な招待コード
                        </Text>
                        <HStack>
                          <Tooltip label="招待コード一覧を更新">
                            <IconButton
                              aria-label="更新"
                              icon={<FiRefreshCw />}
                              size="sm"
                              variant="ghost"
                              isLoading={isLoadingCodes}
                              onClick={fetchAvailableInviteCodes}
                            />
                          </Tooltip>
                          <Button
                            size="sm"
                            variant="ghost"
                            leftIcon={isCodesVisible ? <FiEyeOff /> : <FiEye />}
                            onClick={toggleCodesVisible}
                          >
                            {isCodesVisible ? '非表示' : '表示'}
                          </Button>
                        </HStack>
                      </HStack>

                      <Collapse in={isCodesVisible} animateOpacity>
                        {isLoadingCodes ? (
                          <Alert status="info">
                            <AlertIcon />
                            招待コードを取得中...
                          </Alert>
                        ) : availableInviteCodes.length === 0 ? (
                          <Alert status="warning">
                            <AlertIcon />
                            <VStack align="start" spacing={1}>
                              <Text fontSize="sm" fontWeight="medium">利用可能な招待コードがありません</Text>
                              <Text fontSize="xs">管理者に招待コードの発行を依頼してください。</Text>
                            </VStack>
                          </Alert>
                        ) : (
                          <Card bg="gray.50" borderWidth="1px">
                            <CardBody p={4}>
                              <VStack spacing={3} align="stretch">
                                <Text fontSize="xs" color="gray.600">
                                  以下の招待コードをクリックして入力フィールドにセットできます
                                </Text>
                                {availableInviteCodes.map((code, index) => (
                                  <Box
                                    key={index}
                                    p={3}
                                    bg="white"
                                    borderRadius="md"
                                    borderWidth="1px"
                                    borderColor="gray.200"
                                  >
                                    <HStack justify="space-between" align="center">
                                      <VStack align="start" spacing={1} flex={1}>
                                        <HStack>
                                          <Code
                                            colorScheme="blue"
                                            fontSize="lg"
                                            fontWeight="bold"
                                            cursor="pointer"
                                            onClick={() => selectInviteCode(code.token)}
                                            _hover={{ bg: 'blue.100' }}
                                            p={2}
                                          >
                                            {code.token}
                                          </Code>
                                          <Badge colorScheme="green" variant="solid">
                                            有効
                                          </Badge>
                                        </HStack>
                                        <Text fontSize="xs" color="gray.500">
                                          有効期限: {new Date(code.expiresAt).toLocaleString('ja-JP')}
                                        </Text>
                                      </VStack>
                                      <VStack spacing={1}>
                                        <Tooltip label="このコードを選択">
                                          <Button
                                            size="xs"
                                            colorScheme="blue"
                                            variant="outline"
                                            onClick={() => selectInviteCode(code.token)}
                                          >
                                            選択
                                          </Button>
                                        </Tooltip>
                                        <Tooltip label="コピー">
                                          <IconButton
                                            aria-label="コピー"
                                            icon={<FiCopy />}
                                            size="xs"
                                            variant="ghost"
                                            onClick={() => copyInviteCode(code.token)}
                                          />
                                        </Tooltip>
                                      </VStack>
                                    </HStack>
                                  </Box>
                                ))}
                              </VStack>
                            </CardBody>
                          </Card>
                        )}
                      </Collapse>
                    </Box>
                  </VStack>
                )}

                <Button
                  type="submit"
                  size="lg"
                  w="full"
                  isLoading={isLoading}
                  loadingText="登録中..."
                >
                  アカウント作成
                </Button>
              </VStack>
            </form>

            <VStack spacing={2}>
              <Text fontSize="sm" color="gray.600" textAlign="center">
                アカウントをお持ちの方は
                <Link
                  as={RouterLink}
                  to={ROUTES.LOGIN}
                  color="primary.500"
                  fontWeight="semibold"
                  ml={1}
                >
                  ログイン
                </Link>
              </Text>
            </VStack>
          </VStack>
        </CardBody>
      </Card>
    </Flex>
  )
}

export default RegisterPage