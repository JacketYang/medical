/**
 * 产品列表页面
 * 展示所有产品，支持搜索、筛选和分页
 */

import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Search, Filter, Grid, List, ChevronDown } from 'lucide-react'
import { productsApi, Product } from '../api/api'
import ProductCard from '../components/ProductCard'

const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 12,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  })
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filtersOpen, setFiltersOpen] = useState(false)

  // 从URL参数获取筛选条件
  const searchQuery = searchParams.get('q') || ''
  const category = searchParams.get('category') || ''
  const sortBy = searchParams.get('sort') || 'created_at'
  const sortOrder = searchParams.get('order') || 'desc'
  const currentPage = parseInt(searchParams.get('page') || '1')

  const categories = [
    { value: 'medical-equipment', label: '医疗设备' },
    { value: 'surgical-instruments', label: '手术器械' },
    { value: 'diagnostic-equipment', label: '诊断设备' },
    { value: 'rehabilitation-equipment', label: '康复设备' },
  ]

  const sortOptions = [
    { value: 'created_at', label: '最新发布' },
    { value: 'price', label: '价格从低到高' },
    { value: 'price_desc', label: '价格从高到低' },
    { value: 'name', label: '名称A-Z' },
  ]

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true)
      try {
        const params: any = {
          page: currentPage,
          pageSize: pagination.pageSize,
        }

        if (searchQuery) params.q = searchQuery
        if (category) params.category = category

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
  }, [currentPage, searchQuery, category, sortBy, sortOrder])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const query = formData.get('search') as string
    
    const newParams = new URLSearchParams(searchParams)
    if (query) {
      newParams.set('q', query)
    } else {
      newParams.delete('q')
    }
    newParams.set('page', '1')
    setSearchParams(newParams)
  }

  const handleCategoryChange = (categoryValue: string) => {
    const newParams = new URLSearchParams(searchParams)
    if (categoryValue) {
      newParams.set('category', categoryValue)
    } else {
      newParams.delete('category')
    }
    newParams.set('page', '1')
    setSearchParams(newParams)
  }

  const handleSortChange = (sortValue: string) => {
    const newParams = new URLSearchParams(searchParams)
    if (sortValue === 'price_desc') {
      newParams.set('sort', 'price')
      newParams.set('order', 'desc')
    } else if (sortValue === 'price') {
      newParams.set('sort', 'price')
      newParams.set('order', 'asc')
    } else {
      newParams.set('sort', sortValue)
      newParams.delete('order')
    }
    newParams.set('page', '1')
    setSearchParams(newParams)
  }

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('page', page.toString())
    setSearchParams(newParams)
  }

  return (
    <>
      <Helmet>
        <title>产品中心 - 医疗器械销售官网</title>
        <meta name="description" content="浏览我们的医疗器械产品目录，包括医疗设备、手术器械、诊断设备等专业产品" />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 面包屑导航 */}
        <nav className="breadcrumb mb-8">
          <Link to="/" className="breadcrumb-item">首页</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="text-gray-900">产品中心</span>
        </nav>

        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">产品中心</h1>
          <p className="text-lg text-gray-600">
            专业医疗设备，满足您的各种需求
          </p>
        </div>

        {/* 搜索和筛选栏 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 搜索框 */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  name="search"
                  defaultValue={searchQuery}
                  placeholder="搜索产品名称..."
                  className="input pl-10"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </form>
            </div>

            {/* 分类筛选 */}
            <div>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="input"
              >
                <option value="">所有分类</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 排序 */}
            <div>
              <select
                value={sortBy === 'price' && sortOrder === 'desc' ? 'price_desc' : sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="input"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 移动端筛选按钮 */}
          <div className="md:hidden mt-4 flex justify-between items-center">
            <button
              className="btn-secondary flex items-center space-x-2"
              onClick={() => setFiltersOpen(!filtersOpen)}
            >
              <Filter className="h-4 w-4" />
              <span>筛选</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
            </button>

            <div className="flex space-x-2">
              <button
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-500'}`}
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-500'}`}
                onClick={() => setViewMode('list')}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* 结果统计 */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-gray-600">
            共找到 <span className="font-semibold text-gray-900">{pagination.total}</span> 个产品
          </div>

          <div className="hidden md:flex space-x-2">
            <button
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-500'}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-500'}`}
              onClick={() => setViewMode('list')}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* 产品列表 */}
        {loading ? (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
            {[...Array(8)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">未找到相关产品</h3>
            <p className="text-gray-600 mb-6">
              尝试调整搜索条件或浏览其他产品分类
            </p>
            <Link to="/products" className="btn-primary">
              清除筛选条件
            </Link>
          </div>
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

export default Products