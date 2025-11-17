/**
 * 管理员登录页面
 * 处理管理员用户登录认证
 */

import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import { authApi } from '../api/api'

const AdminLogin: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // 清除错误信息
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.username || !formData.password) {
      setError('请输入用户名和密码')
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await authApi.login(formData.username, formData.password)
      
      if (result.success) {
        // 保存用户信息到localStorage
        localStorage.setItem('user_info', JSON.stringify(result.data?.user))
        navigate('/admin')
      } else {
        setError(result.error || '登录失败，请重试')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>管理员登录 - 医疗器械销售官网</title>
        <meta name="description" content="医疗器械销售官网管理员登录页面" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">管理后台</span>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            登录到管理后台
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            请使用您的管理员账号登录
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* 错误提示 */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 用户名 */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  用户名
                </label>
                <div className="mt-1">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={formData.username}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="请输入用户名"
                  />
                </div>
              </div>

              {/* 密码 */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  密码
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="input pr-10"
                    placeholder="请输入密码"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* 记住我 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    记住我
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                    忘记密码？
                  </a>
                </div>
              </div>

              {/* 登录按钮 */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors ${
                    loading ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      登录中...
                    </>
                  ) : (
                    '登录'
                  )}
                </button>
              </div>
            </form>

            {/* 返回前台 */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">或</span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Link
                  to="/"
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  返回网站首页
                </Link>
              </div>
            </div>

            {/* 开发环境提示 */}
            {import.meta.env.DEV && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">开发环境提示：</p>
                  <p>默认管理员账号：admin</p>
                  <p>默认密码：admin123</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default AdminLogin