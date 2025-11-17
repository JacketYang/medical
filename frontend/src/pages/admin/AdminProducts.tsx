/**
 * 管理后台产品管理页面
 * 处理产品的增删改查操作
 */

import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Plus, Edit, Trash2, Search, Filter, Eye, Upload, X } from 'lucide-react'
import { productsApi, Product } from '../api/api'

interface ProductFormData {
  name: string
  summary: string
  description: string
  price: number
  category: string
  images: string[]
  specs: Record<string, any>
  featured: boolean
  status: string
}

const AdminProducts: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
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
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    summary: '',
    description: '',
    price: 0,
    category: '',
    images: [],
    specs: {},
    featured: false,
    status: 'active',
  })
  const [submitting, setSubmitting] = useState(false)

  const categories = [
    '医疗设备',
    '手术器械',
    '诊断设备',
    '康复设备',
  ]

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true)
      try {
        const params: any = {
          page: pagination.page,
          pageSize: pagination.pageSize,
        }

        if (searchQuery) {
          params.q = searchQuery
        }

        const response = await productsApi.getProducts(params)
        
        if (response.success && response.data) {
          setProducts(response.data.items)
          setPagination(response.data.pagination)
        }
      } catch (error) {
        console.error('Failed to load products:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [pagination.page, searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const query = formData.get('search') as string
    setSearchQuery(query)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleCreate = () => {
    setEditingProduct(null)
    setFormData({
      name: '',
      summary: '',
      description: '',
      price: 0,
      category: '',
      images: [],
      specs: {},
      featured: false,
      status: 'active',
    })
    setShowModal(true)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      summary: product.summary,
      description: product.description,
      price: product.price,
      category: product.category,
      images: product.images,
      specs: product.specs,
      featured: product.featured,
      status: product.status,
    })
    setShowModal(true)
  }

  const handleDelete = async (product: Product) => {
    if (!confirm(`确定要删除产品 "${product.name}" 吗？`)) {
      return
    }

    try {
      const response = await productsApi.deleteProduct(product.id)
      if (response.success) {
        setProducts(products.filter(p => p.id !== product.id))
      }
    } catch (error) {
      console.error('Failed to delete product:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      let response
      if (editingProduct) {
        response = await productsApi.updateProduct(editingProduct.id, formData)
      } else {
        response = await productsApi.createProduct(formData)
      }

      if (response.success) {
        setShowModal(false)
        // 重新加载产品列表
        window.location.reload()
      }
    } catch (error) {
      console.error('Failed to save product:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseFloat(value) || 0 : value
    }))
  }

  const handleImageAdd = (url: string) => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, url]
    }))
  }

  const handleImageRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleSpecChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      specs: {
        ...prev.specs,
        [key]: value
      }
    }))
  }

  const handleSpecRemove = (key: string) => {
    const newSpecs = { ...formData.specs }
    delete newSpecs[key]
    setFormData(prev => ({
      ...prev,
      specs: newSpecs
    }))
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">产品管理</h1>
          <p className="text-gray-600">管理网站中的产品信息</p>
        </div>
        <button
          onClick={handleCreate}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          添加产品
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
                placeholder="搜索产品名称..."
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

      {/* 产品列表 */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  产品
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  分类
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  价格
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  创建时间
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
                    <td colSpan={6} className="px-6 py-4 text-center">
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : products.length > 0 ? (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={product.images[0] || 'https://via.placeholder.com/40x40?text=产品'}
                            alt={product.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500 line-clamp-1">
                            {product.summary}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {product.category || '未分类'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ¥{product.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.status === 'active' ? '启用' : '禁用'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(product.created_at).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-primary-600 hover:text-primary-900"
                          title="编辑"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
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
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="mb-4">
                      <Filter className="h-12 w-12 mx-auto text-gray-300" />
                    </div>
                    <p className="text-lg font-medium mb-2">暂无产品</p>
                    <p className="text-sm mb-4">点击上方按钮添加第一个产品</p>
                    <button onClick={handleCreate} className="btn-primary">
                      <Plus className="h-4 w-4 mr-2" />
                      添加产品
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

      {/* 产品编辑模态框 */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingProduct ? '编辑产品' : '添加产品'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 基本信息 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      产品名称 *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      产品分类
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="input"
                    >
                      <option value="">请选择分类</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      价格 *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      step="0.01"
                      min="0"
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      状态
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="input"
                    >
                      <option value="active">启用</option>
                      <option value="inactive">禁用</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="featured"
                      id="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="featured" className="ml-2 text-sm text-gray-700">
                      推荐产品
                    </label>
                  </div>
                </div>

                {/* 详细信息 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      产品简介
                    </label>
                    <textarea
                      name="summary"
                      value={formData.summary}
                      onChange={handleInputChange}
                      rows={3}
                      className="textarea"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      详细描述
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={6}
                      className="textarea"
                    />
                  </div>
                </div>
              </div>

              {/* 图片管理 */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  产品图片
                </label>
                <div className="space-y-2">
                  {formData.images.map((image, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={image}
                        onChange={(e) => {
                          const newImages = [...formData.images]
                          newImages[index] = e.target.value
                          setFormData(prev => ({ ...prev, images: newImages }))
                        }}
                        className="input flex-1"
                        placeholder="图片 URL"
                      />
                      <button
                        type="button"
                        onClick={() => handleImageRemove(index)}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleImageAdd('')}
                    className="btn-secondary"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    添加图片
                  </button>
                </div>
              </div>

              {/* 产品规格 */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  产品规格
                </label>
                <div className="space-y-2">
                  {Object.entries(formData.specs).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={key}
                        readOnly
                        className="input w-1/3"
                      />
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handleSpecChange(key, e.target.value)}
                        className="input flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => handleSpecRemove(key)}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      specs: { ...prev.specs, ['']: '' }
                    }))}
                    className="btn-secondary"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    添加规格
                  </button>
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

export default AdminProducts