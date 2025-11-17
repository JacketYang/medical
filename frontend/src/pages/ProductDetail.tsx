/**
 * 产品详情页面
 * 展示单个产品的详细信息
 */

import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft, ShoppingCart, Phone, Shield, Truck, Award, Star } from 'lucide-react'
import { productsApi, Product } from '../api/api'

const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    const loadProduct = async () => {
      if (!slug) return

      try {
        const response = await productsApi.getProduct(slug)
        if (response.success && response.data) {
          setProduct(response.data)
        } else {
          setError('产品未找到')
        }
      } catch (error) {
        console.error('Failed to load product:', error)
        setError('加载产品失败')
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [slug])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const features = [
    { icon: Shield, title: '品质保证', description: '严格质量认证' },
    { icon: Truck, title: '快速配送', description: '全国范围配送' },
    { icon: Award, title: '专业服务', description: '技术支持保障' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{error || '产品未找到'}</h1>
          <Link to="/products" className="btn-primary">
            返回产品列表
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>{product.name} - 医疗器械销售官网</title>
        <meta name="description" content={product.summary} />
        <meta property="og:title" content={product.name} />
        <meta property="og:description" content={product.summary} />
        <meta property="og:type" content="product" />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 面包屑导航 */}
        <nav className="breadcrumb mb-8">
          <Link to="/" className="breadcrumb-item">首页</Link>
          <span className="breadcrumb-separator">/</span>
          <Link to="/products" className="breadcrumb-item">产品中心</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        {/* 产品信息 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* 产品图片 */}
          <div>
            <div className="aspect-w-1 aspect-h-1 bg-gray-100 rounded-lg overflow-hidden mb-4">
              <img
                src={product.images[selectedImage] || 'https://via.placeholder.com/600x600?text=产品图片'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* 缩略图 */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-w-1 aspect-h-1 rounded overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-primary-500' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 产品详情 */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
            
            {/* 价格和分类 */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl font-bold text-primary-600">
                  {formatPrice(product.price)}
                </div>
                {product.category && (
                  <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
                    {product.category}
                  </span>
                )}
              </div>
              
              {/* 评分 */}
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                  />
                ))}
                <span className="text-gray-600 ml-2">(4.0 / 5.0)</span>
              </div>
            </div>

            {/* 产品简介 */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">产品简介</h3>
              <p className="text-gray-600 leading-relaxed">{product.summary}</p>
            </div>

            {/* 产品规格 */}
            {product.specs && Object.keys(product.specs).length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">产品规格</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <dl className="grid grid-cols-2 gap-4">
                    {Object.entries(product.specs).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <dt className="text-gray-600">{key}:</dt>
                        <dd className="font-medium text-gray-900">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            )}

            {/* 购买按钮 */}
            <div className="flex space-x-4 mb-8">
              <button className="btn-primary flex-1 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                立即购买
              </button>
              <button className="btn-secondary flex items-center justify-center">
                <Phone className="h-5 w-5 mr-2" />
                咨询客服
              </button>
            </div>

            {/* 服务保障 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {features.map((feature) => {
                const Icon = feature.icon
                return (
                  <div key={feature.title} className="text-center">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Icon className="h-6 w-6 text-primary-600" />
                    </div>
                    <h4 className="font-medium text-gray-900 text-sm">{feature.title}</h4>
                    <p className="text-gray-600 text-xs">{feature.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* 详细描述 */}
        <div className="card mb-16">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-gray-900">产品详情</h2>
          </div>
          <div className="card-body">
            <div 
              className="prose max-w-none prose-gray"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>
        </div>

        {/* 相关产品 */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">相关产品</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 这里可以加载相关产品 */}
            <div className="text-center text-gray-500 col-span-3">
              相关产品加载中...
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ProductDetail