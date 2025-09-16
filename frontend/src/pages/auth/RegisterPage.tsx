import React, { useState } from 'react'
import {
  Box,
  Flex,
  VStack,
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
} from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { RegisterRequest, ROUTES } from '../../types/index'
import { authService } from '../../services/authService'

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
  const navigate = useNavigate()
  const toast = useToast()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'ADMIN'
    }
  })

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