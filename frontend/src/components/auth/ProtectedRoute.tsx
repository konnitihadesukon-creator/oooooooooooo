import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { ROUTES } from '../../types/index'

interface ProtectedRouteProps {
  allowedRoles?: ('ADMIN' | 'EMPLOYEE')[]
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  allowedRoles 
}) => {
  const { user, isLoading } = useAuthStore()
  const location = useLocation()

  // ローディング中は何も表示しない（または専用のローディング画面）
  if (isLoading) {
    return null
  }

  // 未認証の場合はログインページにリダイレクト
  if (!user) {
    return (
      <Navigate 
        to={ROUTES.LOGIN} 
        state={{ from: location.pathname }} 
        replace 
      />
    )
  }

  // ロール制限がある場合のチェック
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // 権限がない場合は適切なページにリダイレクト
    const redirectPath = user.role === 'ADMIN' ? '/admin' : '/employee'
    return <Navigate to={redirectPath} replace />
  }

  return <Outlet />
}

export default ProtectedRoute