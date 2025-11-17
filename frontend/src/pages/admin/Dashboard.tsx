/**
 * 管理后台仪表盘页面
 * 显示系统概览和统计数据
 */

import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { Package, FileText, Users, TrendingUp, Eye, Plus } from 'lucide-react'
import { productsApi, postsApi, Product, Post } from '../api/api'

interface DashboardStats {
  totalProducts: number
  totalPosts: number
  totalUsers: number
  recentProducts: Product[]
  recentPosts: Post[]
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalPosts: 0,
    totalUsers: 0,
    recentProducts: [],
    recentPosts: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // 加载产品数据
        const productsResponse = await productsApi.getProducts({ pageSize: 5 })
        const productsData = productsResponse.success ? productsResponse.data : null

        // 加载文章数据
        const postsResponse = await postsApi.getPosts({ pageSize: 5 })
        const postsData = postsResponse.success ? postsResponse.data : null

        setStats({
          totalProducts: productsData?.pagination.total || 0,
          totalPosts: postsData?.pagination.total || 0,
          totalUsers: 1, // 简化处理，实际应该从API获取
          recentProducts: productsData?.items || [],
          recentPosts: postsData?.items || [],
        })
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const statCards = [
    {
      title: '产品总数',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-blue-500',
      link: '/admin/products',
    },
    {
      title: '文章总数',
      value: stats.totalPosts,
      icon: FileText,
      color: 'bg-green-500',
      link: '/admin/posts',
    },
    {
      title: '管理员',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-purple-500',
      link: '#',
    },
    {
      title: '今日访问',
      value: '234',
      icon: TrendingUp,
      color: 'bg-orange-500',
      link: '#',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>仪表盘 - 管理后台</title>
      </Helmet>

      <div className="space-y-6">
        {/* 页面标题 */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">仪表盘</h1>
          <p className="text-gray-600">系统概览和快速操作</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => {
            const Icon = stat.icon
            return (
              <Link
                key={stat.title}
                to={stat.link}
                className="card hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="card-body">
                  <div className="flex items-center">
                    <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center mr-4`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 最新产品 */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">最新产品</h3>
                <Link
                  to="/admin/products"
                  className="text-primary-600 hover:text-primary-700 text-sm flex items-center"
                >
                  查看全部
                  <Eye className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="card-body">
              {stats.recentProducts.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                          {product.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          ¥{product.price.toLocaleString()} • {product.category}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Link
                          to={`/admin/products?edit=${product.id}`}
                          className="text-primary-600 hover:text-primary-700 text-sm"
                        >
                          编辑
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>暂无产品</p>
                  <Link
                    to="/admin/products?create=true"
                    className="btn-primary mt-4 text-sm"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    添加产品
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* 最新文章 */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">最新文章</h3>
                <Link
                  to="/admin/posts"
                  className="text-primary-600 hover:text-primary-700 text-sm flex items-center"
                >
                  查看全部
                  <Eye className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="card-body">
              {stats.recentPosts.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentPosts.map((post) => (
                    <div key={post.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                          {post.title}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {post.author} • {new Date(post.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Link
                          to={`/admin/posts?edit=${post.id}`}
                          className="text-primary-600 hover:text-primary-700 text-sm"
                        >
                          编辑
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>暂无文章</p>
                  <Link
                    to="/admin/posts?create=true"
                    className="btn-primary mt-4 text-sm"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    添加文章
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 快速操作 */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">快速操作</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/admin/products?create=true"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <Plus className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">添加产品</h4>
                  <p className="text-sm text-gray-500">发布新的医疗设备</p>
                </div>
              </Link>

              <Link
                to="/admin/posts?create=true"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <Plus className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">发布文章</h4>
                  <p className="text-sm text-gray-500">分享行业资讯</p>
                </div>
              </Link>

              <Link
                to="/admin/settings"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <Package className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">站点设置</h4>
                  <p className="text-sm text-gray-500">配置网站信息</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AdminDashboard