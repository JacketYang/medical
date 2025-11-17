/**
 * 网站底部组件
 * 包含公司信息、链接、版权等
 */

import React from 'react'
import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin, Facebook, Twitter, Linkedin, Youtube } from 'lucide-react'

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  const companyInfo = {
    name: '医疗器械销售有限公司',
    address: '北京市朝阳区医疗科技园区',
    phone: '400-123-4567',
    email: 'info@medsales.com',
  }

  const quickLinks = [
    { name: '关于我们', href: '/about' },
    { name: '产品中心', href: '/products' },
    { name: '新闻资讯', href: '/news' },
    { name: '联系我们', href: '/contact' },
    { name: '售后服务', href: '/service' },
    { name: '隐私政策', href: '/privacy' },
  ]

  const productCategories = [
    { name: '医疗设备', href: '/products?category=medical-equipment' },
    { name: '手术器械', href: '/products?category=surgical-instruments' },
    { name: '诊断设备', href: '/products?category=diagnostic-equipment' },
    { name: '康复设备', href: '/products?category=rehabilitation-equipment' },
  ]

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: '#' },
    { name: 'Twitter', icon: Twitter, href: '#' },
    { name: 'LinkedIn', icon: Linkedin, href: '#' },
    { name: 'YouTube', icon: Youtube, href: '#' },
  ]

  return (
    <footer className="bg-gray-900 text-white">
      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* 公司信息 */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="text-xl font-bold">{companyInfo.name}</span>
            </div>
            <p className="text-gray-300 mb-4 text-sm leading-relaxed">
              专业医疗器械销售平台，致力于为医疗机构提供高品质的医疗设备和解决方案，守护人类健康。
            </p>
            
            {/* 联系信息 */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2 text-gray-300">
                <MapPin className="h-4 w-4 text-primary-400" />
                <span>{companyInfo.address}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Phone className="h-4 w-4 text-primary-400" />
                <span>{companyInfo.phone}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Mail className="h-4 w-4 text-primary-400" />
                <span>{companyInfo.email}</span>
              </div>
            </div>
          </div>

          {/* 快速链接 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">快速链接</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-primary-400 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 产品分类 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">产品分类</h3>
            <ul className="space-y-2">
              {productCategories.map((category) => (
                <li key={category.name}>
                  <Link
                    to={category.href}
                    className="text-gray-300 hover:text-primary-400 transition-colors text-sm"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 关注我们 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">关注我们</h3>
            <p className="text-gray-300 mb-4 text-sm">
              关注我们的社交媒体，获取最新产品信息和行业动态
            </p>
            
            {/* 社交媒体链接 */}
            <div className="flex space-x-4 mb-6">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-300 hover:bg-primary-600 hover:text-white transition-colors"
                    aria-label={social.name}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                )
              })}
            </div>

            {/* 订阅表单 */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="font-medium mb-2 text-sm">订阅产品资讯</h4>
              <form className="space-y-2">
                <input
                  type="email"
                  placeholder="您的邮箱"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
                <button
                  type="submit"
                  className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors text-sm font-medium"
                >
                  订阅
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* 底部版权信息 */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <div className="mb-4 md:mb-0">
              <p>&copy; {currentYear} {companyInfo.name}. 保留所有权利.</p>
            </div>
            <div className="flex space-x-6">
              <a href="/privacy" className="hover:text-primary-400 transition-colors">
                隐私政策
              </a>
              <a href="/terms" className="hover:text-primary-400 transition-colors">
                服务条款
              </a>
              <a href="/sitemap" className="hover:text-primary-400 transition-colors">
                网站地图
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer