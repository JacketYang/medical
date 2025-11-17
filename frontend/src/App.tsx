/**
 * 主应用组件
 * 包含路由配置和全局布局
 */

import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import News from './pages/News'
import NewsDetail from './pages/NewsDetail'
import AdminLogin from './pages/AdminLogin'
import AdminLayout from './components/AdminLayout'
import AdminDashboard from './pages/admin/Dashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminPosts from './pages/admin/AdminPosts'
import AdminSettings from './pages/admin/AdminSettings'
import { useAuth } from './hooks/useAuth'

// 前台页面布局组件
const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}

// 受保护的管理员路由组件
const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  return <AdminLayout>{children}</AdminLayout>
}

function App() {
  return (
    <>
      <Helmet>
        <title>医疗器械销售官网 - 专业医疗设备供应商</title>
        <meta name="description" content="专业医疗器械销售平台，提供高品质医疗设备和手术器械，值得信赖的医疗设备供应商" />
      </Helmet>
      
      <Routes>
        {/* 前台路由 */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/products" element={<PublicLayout><Products /></PublicLayout>} />
        <Route path="/products/:slug" element={<PublicLayout><ProductDetail /></PublicLayout>} />
        <Route path="/news" element={<PublicLayout><News /></PublicLayout>} />
        <Route path="/news/:slug" element={<PublicLayout><NewsDetail /></PublicLayout>} />
        
        {/* 管理员登录 */}
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* 管理员路由（需要认证） */}
        <Route path="/admin" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
        <Route path="/admin/products" element={<ProtectedAdminRoute><AdminProducts /></ProtectedAdminRoute>} />
        <Route path="/admin/posts" element={<ProtectedAdminRoute><AdminPosts /></ProtectedAdminRoute>} />
        <Route path="/admin/settings" element={<ProtectedAdminRoute><AdminSettings /></ProtectedAdminRoute>} />
        
        {/* 404页面 */}
        <Route path="*" element={<PublicLayout>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">页面未找到</h1>
            <p className="text-gray-600 mb-8">抱歉，您访问的页面不存在</p>
            <a href="/" className="btn-primary">返回首页</a>
          </div>
        </PublicLayout>} />
      </Routes>
    </>
  )
}

export default App