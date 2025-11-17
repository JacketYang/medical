/**
 * 新闻列表页面
 * 展示所有新闻资讯
 */

import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Calendar, User, ArrowRight, Search } from 'lucide-react'
import { postsApi, Post } from '../api/api'

const News: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 9,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  })
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const params: any = {
          page: pagination.page,
          pageSize: pagination.pageSize,
        }

        if (searchQuery) {
          params.q = searchQuery
        }

        const response = await postsApi.getPosts(params)
        
        if (response.success && response.data) {
          setPosts(response.data.items)
          setPagination(response.data.pagination)
        }
      } catch (error) {
        console.error('Failed to load posts:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPosts()
  }, [pagination.page, searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const query = formData.get('search') as string
    setSearchQuery(query)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }))
  }

  const featuredPosts = posts.filter(post => post.featured)
  const regularPosts = posts.filter(post => !post.featured)

  return (
    <>
      <Helmet>
        <title>新闻资讯 - 医疗器械销售官网</title>
        <meta name="description" content="了解最新的医疗器械行业动态、产品资讯和医疗技术发展趋势" />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 面包屑导航 */}
        <nav className="breadcrumb mb-8">
          <Link to="/" className="breadcrumb-item">首页</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="text-gray-900">新闻资讯</span>
        </nav>

        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">新闻资讯</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            了解最新的医疗器械行业动态、产品资讯和医疗技术发展趋势
          </p>
        </div>

        {/* 搜索框 */}
        <div className="max-w-2xl mx-auto mb-12">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              name="search"
              placeholder="搜索新闻资讯..."
              className="input pl-10 pr-4 py-3 text-lg"
            />
            <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <button
              type="submit"
              className="absolute right-2 top-2 btn-primary px-6 py-2"
            >
              搜索
            </button>
          </form>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* 推荐文章 */}
            {featuredPosts.length > 0 && (
              <div className="mb-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">推荐阅读</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {featuredPosts.map((post) => (
                    <article key={post.id} className="card hover:shadow-lg transition-shadow">
                      <div className="card-body">
                        <div className="flex items-center text-sm text-gray-500 mb-4">
                          <Calendar className="h-4 w-4 mr-1" />
                          <time>{new Date(post.created_at).toLocaleDateString('zh-CN')}</time>
                          <span className="mx-2">•</span>
                          <User className="h-4 w-4 mr-1" />
                          <span>{post.author}</span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                          <Link to={`/news/${post.slug}`} className="hover:text-primary-600 transition-colors">
                            {post.title}
                          </Link>
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-3">{post.summary}</p>
                        <Link
                          to={`/news/${post.slug}`}
                          className="text-primary-600 hover:text-primary-700 font-medium flex items-center"
                        >
                          阅读全文
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {/* 普通文章列表 */}
            {regularPosts.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-8">最新资讯</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {regularPosts.map((post) => (
                    <article key={post.id} className="card hover:shadow-lg transition-shadow">
                      <div className="card-body">
                        <div className="flex items-center text-sm text-gray-500 mb-4">
                          <Calendar className="h-4 w-4 mr-1" />
                          <time>{new Date(post.created_at).toLocaleDateString('zh-CN')}</time>
                          <span className="mx-2">•</span>
                          <User className="h-4 w-4 mr-1" />
                          <span>{post.author}</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          <Link to={`/news/${post.slug}`} className="hover:text-primary-600 transition-colors">
                            {post.title}
                          </Link>
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-3">{post.summary}</p>
                        <Link
                          to={`/news/${post.slug}`}
                          className="text-primary-600 hover:text-primary-700 font-medium flex items-center"
                        >
                          阅读更多
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {/* 无结果 */}
            {posts.length === 0 && (
              <div className="text-center py-16">
                <div className="text-gray-400 mb-4">
                  <Search className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">未找到相关资讯</h3>
                <p className="text-gray-600 mb-6">
                  尝试调整搜索关键词或浏览其他内容
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="btn-primary"
                >
                  清除搜索条件
                </button>
              </div>
            )}
          </>
        )}

        {/* 分页 */}
        {pagination.totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <nav className="flex space-x-2">
              <button
                className={`px-3 py-2 rounded-md ${pagination.hasPrev ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                onClick={() => pagination.hasPrev && handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrev}
              >
                上一页
              </button>

              {[...Array(pagination.totalPages)].map((_, index) => {
                const page = index + 1
                const isCurrent = page === pagination.page
                
                return (
                  <button
                    key={page}
                    className={`px-3 py-2 rounded-md ${isCurrent ? 'bg-primary-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                )
              })}

              <button
                className={`px-3 py-2 rounded-md ${pagination.hasNext ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                onClick={() => pagination.hasNext && handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNext}
              >
                下一页
              </button>
            </nav>
          </div>
        )}
      </div>
    </>
  )
}

export default News