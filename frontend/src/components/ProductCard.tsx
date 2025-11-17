/**
 * 产品卡片组件
 * 在产品列表页面显示单个产品信息
 */

import React from 'react'
import { Link } from 'react-router-dom'
import { Product } from '../api/api'
import { Eye, ShoppingCart } from 'lucide-react'

interface ProductCardProps {
  product: Product
  className?: string
}

const ProductCard: React.FC<ProductCardProps> = ({ product, className = '' }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getImageUrl = (product: Product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0]
    }
    // 使用placeholder图片
    return 'https://via.placeholder.com/300x200?text=产品图片'
  }

  return (
    <div className={`card hover:shadow-lg transition-shadow duration-300 ${className}`}>
      {/* 产品图片 */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <Link to={`/products/${product.slug}`}>
          <img
            src={getImageUrl(product)}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </Link>
        
        {/* 推荐标签 */}
        {product.featured && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs font-medium rounded">
            推荐
          </div>
        )}
        
        {/* 分类标签 */}
        {product.category && (
          <div className="absolute top-2 right-2 bg-primary-600 text-white px-2 py-1 text-xs font-medium rounded">
            {product.category}
          </div>
        )}
      </div>

      {/* 产品信息 */}
      <div className="card-body">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            <Link 
              to={`/products/${product.slug}`}
              className="hover:text-primary-600 transition-colors"
            >
              {product.name}
            </Link>
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2">
            {product.summary}
          </p>
        </div>

        {/* 产品规格 */}
        {product.specs && Object.keys(product.specs).length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-2">
              {Object.entries(product.specs).slice(0, 2).map(([key, value]) => (
                <div
                  key={key}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                >
                  {key}: {value}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 价格和操作 */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="text-primary-600">
            <span className="text-2xl font-bold">{formatPrice(product.price)}</span>
          </div>
          
          <div className="flex space-x-2">
            <Link
              to={`/products/${product.slug}`}
              className="btn-secondary text-sm"
              title="查看详情"
            >
              <Eye className="h-4 w-4" />
            </Link>
            <button
              className="btn-primary text-sm"
              title="立即购买"
              onClick={() => {
                // 这里可以添加购买逻辑
                console.log('购买产品:', product.name)
              }}
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductCard