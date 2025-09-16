import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore()

  // ユーザーのロールに基づいてリダイレクト
  if (user?.role === 'ADMIN') {
    return <Navigate to="/admin" replace />
  } else if (user?.role === 'EMPLOYEE') {
    return <Navigate to="/employee" replace />
  }

  // 念のためログインページにリダイレクト
  return <Navigate to="/login" replace />
}

export default DashboardPage