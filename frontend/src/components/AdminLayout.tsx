/**
 * 管理后台布局组件
 * 包含侧边栏导航和顶部栏
 */

import React, { useState } from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'
import { authApi } from '../api/api'
import {
  LayoutDashboard,
  Package,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown
} from 'lucide-react'

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const location = useLocation()

  // 从localStorage获取用户信息
  const getUserInfo = () => {
    const userStr = localStorage.getItem('user_info')
    return userStr ? JSON.parse(userStr) : { username: 'Admin' }
  }

  const handleLogout = () => {
    authApi.logout()
  }

  const navigation = [
    {
      name: '仪表盘',
      href: '/admin',
      icon: LayoutDashboard,
    },
    {
      name: '产品管理',
      href: '/admin/products',
      icon: Package,
    },
    {
      name: '文章管理',
      href: '/admin/posts',
      icon: FileText,
    },
    {
      name: '站点设置',
      href: '/admin/settings',
      icon: Settings,
    },
  ]

  const isActive = (href: string) => {
    if (href === '/admin') {
      return location.pathname === href
    }
    return location.pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 侧边栏 */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="text-xl font-bold text-gray-900">管理后台</span>
          </div>
          <button
            className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive(item.href)
                      ? 'bg-primary-50 text-primary-600 border-r-2 border-primary-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </nav>
      </div>

      {/* 主内容区域 */}
      <div className={`lg:ml-64 flex flex-col min-h-screen ${sidebarOpen ? 'lg:ml-64' : ''}`}>
        {/* 顶部栏 */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>

            <div className="flex items-center space-x-4">
              {/* 用户菜单 */}
              <div className="relative">
                <button
                  className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md p-2"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {getUserInfo().username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden md:block">{getUserInfo().username}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
                        {getUserInfo().username}
                      </div>
                      <button
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4" />
                        <span>退出登录</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* 页面内容 */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* 移动端遮罩 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default AdminLayout