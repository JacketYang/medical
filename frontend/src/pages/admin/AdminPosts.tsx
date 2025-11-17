/**
 * 管理后台文章管理页面
 * 处理新闻文章的增删改查操作
 */

import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Plus, Edit, Trash2, Search, Eye, X } from 'lucide-react'
import { postsApi, Post } from '../api/api'

interface PostFormData {
  title: string
  summary: string
  content: string
  author: string
  status: string
  featured: boolean
}

const AdminPosts: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    summary: '',
    content: '',
    author: '',
    status: 'published',
    featured: false,
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true)
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

  const handleCreate = () => {
    setEditingPost(null)
    setFormData({
      title: '',
      summary: '',
      content: '',
      author: 'Admin',
      status: 'published',
      featured: false,
    })
    setShowModal(true)
  }

  const handleEdit = (post: Post) => {
    setEditingPost(post)
    setFormData({
      title: post.title,
      summary: post.summary,
      content: post.content,
      author: post.author,
      status: post.status,
      featured: post.featured,
    })
    setShowModal(true)
  }

  const handleDelete = async (post: Post) => {
    if (!confirm(`确定要删除文章 "${post.title}" 吗？`)) {
      return
    }

    try {
      const response = await postsApi.deletePost(post.id)
      if (response.success) {
        setPosts(posts.filter(p => p.id !== post.id))
      }
    } catch (error) {
      console.error('Failed to delete post:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      let response
      if (editingPost) {
        response = await postsApi.updatePost(editingPost.id, formData)
      } else {
        response = await postsApi.createPost(formData)
      }

      if (response.success) {
        setShowModal(false)
        // 重新加载文章列表
        window.location.reload()
      }
    } catch (error) {
      console.error('Failed to save post:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">文章管理</h1>
          <p className="text-gray-600">管理网站中的新闻资讯</p>
        </div>
        <button
          onClick={handleCreate}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          发布文章
        </button>
      </div>

      {/* 搜索栏 */}
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSearch} className="flex space-x-4">
            <div className="flex-1 relative">
              <input
                type="text"
                name="search"
                placeholder="搜索文章标题..."
                className="input pl-10"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <button type="submit" className="btn-secondary">
              搜索
            </button>
          </form>
        </div>
      </div>

      {/* 文章列表 */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  文章标题
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  作者
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  发布时间
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                [...Array(5)].map((_, index) => (
                  <tr key={index}>
                    <td colSpan={5} className="px-6 py-4 text-center">
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : posts.length > 0 ? (
                posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {post.title}
                        </div>
                        <div className="text-sm text-gray-500 line-clamp-2">
                          {post.summary}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {post.author}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          post.status === 'published' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {post.status === 'published' ? '已发布' : '草稿'}
                        </span>
                        {post.featured && (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            推荐
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(post.created_at).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <a
                          href={`/news/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-900"
                          title="预览"
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                        <button
                          onClick={() => handleEdit(post)}
                          className="text-primary-600 hover:text-primary-900"
                          title="编辑"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(post)}
                          className="text-red-600 hover:text-red-900"
                          title="删除"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <div className="mb-4">
                      <Search className="h-12 w-12 mx-auto text-gray-300" />
                    </div>
                    <p className="text-lg font-medium mb-2">暂无文章</p>
                    <p className="text-sm mb-4">点击上方按钮发布第一篇文章</p>
                    <button onClick={handleCreate} className="btn-primary">
                      <Plus className="h-4 w-4 mr-2" />
                      发布文章
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-700">
                显示第 {((pagination.page - 1) * pagination.pageSize) + 1} 到{' '}
                {Math.min(pagination.page * pagination.pageSize, pagination.total)} 条，
                共 {pagination.total} 条记录
              </div>
              <div className="flex space-x-2">
                <button
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={!pagination.hasPrev}
                >
                  上一页
                </button>
                <span className="px-3 py-2 text-sm font-medium text-gray-700">
                  第 {pagination.page} 页，共 {pagination.totalPages} 页
                </span>
                <button
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={!pagination.hasNext}
                >
                  下一页
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 文章编辑模态框 */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingPost ? '编辑文章' : '发布文章'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      文章标题 *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      作者
                    </label>
                    <input
                      type="text"
                      name="author"
                      value={formData.author}
                      onChange={handleInputChange}
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    文章摘要
                  </label>
                  <textarea
                    name="summary"
                    value={formData.summary}
                    onChange={handleInputChange}
                    rows={3}
                    className="textarea"
                    placeholder="简短描述文章内容，将显示在文章列表中"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    文章内容 *
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    rows={12}
                    required
                    className="textarea"
                    placeholder="文章正文内容，支持 HTML 格式"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      发布状态
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="input"
                    >
                      <option value="published">已发布</option>
                      <option value="draft">草稿</option>
                    </select>
                  </div>

                  <div className="flex items-center pt-6">
                    <input
                      type="checkbox"
                      name="featured"
                      id="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="featured" className="ml-2 text-sm text-gray-700">
                      设为推荐文章
                    </label>
                  </div>
                </div>
              </div>

              {/* 按钮组 */}
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary disabled:opacity-50"
                >
                  {submitting ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPosts