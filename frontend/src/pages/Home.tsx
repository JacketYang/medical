/**
 * 首页组件
 * 展示网站的主要内容，包括轮播图、特色产品、新闻等
 */

import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowRight, Star, Shield, Truck, Award, Phone } from 'lucide-react'
import { productsApi, postsApi, Product, Post } from '../api/api'
import ProductCard from '../components/ProductCard'

const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [latestNews, setLatestNews] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        // 加载推荐产品
        const productsResponse = await productsApi.getProducts({ pageSize: 8 })
        if (productsResponse.success && productsResponse.data) {
          setFeaturedProducts(productsResponse.data.items.filter(p => p.featured).slice(0, 4))
        }

        // 加载最新文章
        const newsResponse = await postsApi.getPosts({ pageSize: 3 })
        if (newsResponse.success && newsResponse.data) {
          setLatestNews(newsResponse.data.items)
        }
      } catch (error) {
        console.error('Failed to load home data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const features = [
    {
      icon: Shield,
      title: '品质保证',
      description: '所有产品均通过严格的质量认证，确保安全可靠',
    },
    {
      icon: Truck,
      title: '快速配送',
      description: '全国范围快速配送，紧急订单优先处理',
    },
    {
      icon: Award,
      title: '专业服务',
      description: '专业团队提供技术支持和售后服务',
    },
    {
      icon: Phone,
      title: '24小时支持',
      description: '全天候客户服务，随时解答您的疑问',
    },
  ]

  const categories = [
    { name: '医疗设备', href: '/products?category=medical-equipment', image: '/images/medical-equipment.jpg' },
    { name: '手术器械', href: '/products?category=surgical-instruments', image: '/images/surgical-instruments.jpg' },
    { name: '诊断设备', href: '/products?category=diagnostic-equipment', image: '/images/diagnostic-equipment.jpg' },
    { name: '康复设备', href: '/products?category=rehabilitation-equipment', image: '/images/rehabilitation-equipment.jpg' },
  ]

  return (
    <>
      <Helmet>
        <title>医疗器械销售官网 - 专业医疗设备供应商</title>
        <meta name="description" content="专业医疗器械销售平台，提供高品质医疗设备和手术器械，值得信赖的医疗设备供应商" />
      </Helmet>

      {/* 英雄区域 */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                专业医疗器械
                <span className="block text-primary-200">值得信赖的供应商</span>
              </h1>
              <p className="text-xl mb-8 text-primary-100 leading-relaxed">
                我们致力于为医疗机构提供高品质的医疗设备和解决方案，
                以先进的技术和专业的服务守护人类健康。
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link to="/products" className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 text-lg font-medium">
                  浏览产品
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link to="/contact" className="btn border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 text-lg font-medium">
                  联系我们
                </Link>
              </div>
            </div>
            <div className="relative">
              <img
                src="/images/hero-medical.jpg"
                alt="医疗器械"
                className="rounded-lg shadow-2xl"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = 'https://via.placeholder.com/600x400?text=医疗器械'
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 特色服务 */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">为什么选择我们</h2>
            <p className="text-lg text-gray-600">专业的服务，优质的品质，可靠的保障</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={feature.title} className="text-center group">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-600 transition-colors">
                    <Icon className="h-8 w-8 text-primary-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 产品分类 */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">产品分类</h2>
            <p className="text-lg text-gray-600">全面的医疗器械产品线</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={category.href}
                className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
              >
                <div className="aspect-w-16 aspect-h-12 bg-gray-200">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = `https://via.placeholder.com/300x200?text=${category.name}`
                    }}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                  <div className="p-4 text-white">
                    <h3 className="text-lg font-semibold">{category.name}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 推荐产品 */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">推荐产品</h2>
              <p className="text-lg text-gray-600">精选高品质医疗设备</p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            <div className="text-center mt-8">
              <Link to="/products" className="btn-primary">
                查看更多产品
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 最新资讯 */}
      {latestNews.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">最新资讯</h2>
              <p className="text-lg text-gray-600">了解行业动态和产品信息</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {latestNews.map((post) => (
                <article key={post.id} className="card hover:shadow-lg transition-shadow">
                  <div className="card-body">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <time>{new Date(post.created_at).toLocaleDateString('zh-CN')}</time>
                      <span className="mx-2">•</span>
                      <span>{post.author}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      <Link to={`/news/${post.slug}`} className="hover:text-primary-600 transition-colors">
                        {post.title}
                      </Link>
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{post.summary}</p>
                    <Link
                      to={`/news/${post.slug}`}
                      className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center"
                    >
                      阅读更多
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link to="/news" className="btn-secondary">
                查看更多资讯
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA区域 */}
      <section className="bg-primary-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">需要专业的医疗设备解决方案？</h2>
          <p className="text-xl mb-8 text-primary-100">
            联系我们的专业团队，获取个性化的产品推荐和技术支持
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
            <Link to="/contact" className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 text-lg font-medium">
              立即咨询
            </Link>
            <a href="tel:400-123-4567" className="btn border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 text-lg font-medium">
              <Phone className="inline-block mr-2 h-5 w-5" />
              400-123-4567
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

export default Home