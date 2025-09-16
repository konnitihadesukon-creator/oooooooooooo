import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Box, Spinner, Center } from '@chakra-ui/react'
import { useAuthStore } from './store/authStore'
import { ROUTES } from './types/index'

// Page imports
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import EmployeeDashboard from './pages/employee/Dashboard'
import AdminDashboard from './pages/admin/Dashboard'

// Employee Pages
import ShiftRequestPage from './pages/employee/ShiftRequestPage'
import ShiftViewPage from './pages/employee/ShiftViewPage'
import DailyReportPage from './pages/employee/DailyReportPage'
import AttendancePage from './pages/employee/AttendancePage'
import ChatPage from './pages/employee/ChatPage'
import ProfilePage from './pages/employee/ProfilePage'

// Admin Pages
import EmployeeManagementPage from './pages/admin/EmployeeManagementPage'
import ShiftManagementPage from './pages/admin/ShiftManagementPage'
import ReportManagementPage from './pages/admin/ReportManagementPage'
import LocationManagementPage from './pages/admin/LocationManagementPage'
import AnalyticsPage from './pages/admin/AnalyticsPage'
import SettingsPage from './pages/admin/SettingsPage'

// Components
import ProtectedRoute from './components/auth/ProtectedRoute'
import Layout from './components/layout/Layout'

function App() {
  const { user, isLoading, initializeAuth } = useAuthStore()

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="primary.500" thickness="4px" />
      </Center>
    )
  }

  return (
    <Box minH="100vh">
      <Routes>
        {/* 公開ルート */}
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        
        {/* 認証必須ルート */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            {/* ダッシュボード - ロール別リダイレクト */}
            <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
            
            {/* 従業員ルート */}
            <Route path="/employee" element={<EmployeeDashboard />} />
            <Route path={ROUTES.EMPLOYEE.SHIFT_REQUEST} element={<ShiftRequestPage />} />
            <Route path={ROUTES.EMPLOYEE.SHIFT_VIEW} element={<ShiftViewPage />} />
            <Route path={ROUTES.EMPLOYEE.DAILY_REPORT} element={<DailyReportPage />} />
            <Route path={ROUTES.EMPLOYEE.ATTENDANCE} element={<AttendancePage />} />
            <Route path={ROUTES.EMPLOYEE.CHAT} element={<ChatPage />} />
            <Route path={ROUTES.EMPLOYEE.PROFILE} element={<ProfilePage />} />
            
            {/* 管理者ルート */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path={ROUTES.ADMIN.EMPLOYEE_MANAGEMENT} element={<EmployeeManagementPage />} />
            <Route path={ROUTES.ADMIN.SHIFT_MANAGEMENT} element={<ShiftManagementPage />} />
            <Route path={ROUTES.ADMIN.REPORT_MANAGEMENT} element={<ReportManagementPage />} />
            <Route path={ROUTES.ADMIN.LOCATION_MANAGEMENT} element={<LocationManagementPage />} />
            <Route path={ROUTES.ADMIN.ANALYTICS} element={<AnalyticsPage />} />
            <Route path={ROUTES.ADMIN.SETTINGS} element={<SettingsPage />} />
            
            {/* ルートレベルリダイレクト */}
            <Route 
              path="/" 
              element={
                <Navigate 
                  to={user?.role === 'ADMIN' ? '/admin' : '/employee'} 
                  replace 
                />
              } 
            />
          </Route>
        </Route>
        
        {/* 404ページ */}
        <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
      </Routes>
    </Box>
  )
}

export default App