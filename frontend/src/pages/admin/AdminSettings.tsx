/**
 * 管理后台站点设置页面
 * 管理网站的基本配置信息
 */

import React, { useState, useEffect } from 'react'
import { Save, Globe, Mail, Phone, MapPin, FileText } from 'lucide-react'
import { settingsApi } from '../api/api'

interface SiteSettings {
  site_title: string
  site_description: string
  contact_email: string
  contact_phone: string
  company_address: string
  about_us: string
}

const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>({
    site_title: '',
    site_description: '',
    contact_email: '',
    contact_phone: '',
    company_address: '',
    about_us: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await settingsApi.getSettings()
        if (response.success && response.data) {
          const loadedSettings: SiteSettings = {} as SiteSettings
          Object.entries(response.data).forEach(([key, config]) => {
            if (key in settings) {
              loadedSettings[key as keyof SiteSettings] = config.value
            }
          })
          setSettings(loadedSettings)
        }
      } catch (error) {
        console.error('Failed to load settings:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const response = await settingsApi.updateSettings(settings)
      if (response.success) {
        setMessage('设置已保存成功！')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage('保存失败，请重试')
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      setMessage('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">站点设置</h1>
        <p className="text-gray-600">管理网站的基本配置信息</p>
      </div>

      {/* 成功/错误消息 */}
      {message && (
        <div className={`p-4 rounded-md ${
          message.includes('成功') 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* 设置表单 */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 基本信息 */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Globe className="h-5 w-5 mr-2 text-primary-600" />
              基本信息
            </h3>
          </div>
          <div className="card-body space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="site_title" className="block text-sm font-medium text-gray-700 mb-2">
                  网站标题 *
                </label>
                <input
                  type="text"
                  id="site_title"
                  name="site_title"
                  value={settings.site_title}
                  onChange={handleInputChange}
                  required
                  className="input"
                  placeholder="医疗器械销售官网"
                />
                <p className="mt-1 text-sm text-gray-500">
                  网站的标题，将显示在浏览器标题栏和搜索结果中
                </p>
              </div>

              <div>
                <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700 mb-2">
                  联系邮箱 *
                </label>
                <input
                  type="email"
                  id="contact_email"
                  name="contact_email"
                  value={settings.contact_email}
                  onChange={handleInputChange}
                  required
                  className="input"
                  placeholder="info@medsales.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="site_description" className="block text-sm font-medium text-gray-700 mb-2">
                网站描述
              </label>
              <textarea
                id="site_description"
                name="site_description"
                value={settings.site_description}
                onChange={handleInputChange}
                rows={3}
                className="textarea"
                placeholder="专业医疗器械销售平台，提供高品质医疗设备和手术器械"
              />
              <p className="mt-1 text-sm text-gray-500">
                网站描述，用于 SEO 优化和搜索引擎结果展示
              </p>
            </div>
          </div>
        </div>

        {/* 联系信息 */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Phone className="h-5 w-5 mr-2 text-primary-600" />
              联系信息
            </h3>
          </div>
          <div className="card-body space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700 mb-2">
                  联系电话 *
                </label>
                <input
                  type="tel"
                  id="contact_phone"
                  name="contact_phone"
                  value={settings.contact_phone}
                  onChange={handleInputChange}
                  required
                  className="input"
                  placeholder="400-123-4567"
                />
              </div>

              <div>
                <label htmlFor="company_address" className="block text-sm font-medium text-gray-700 mb-2">
                  公司地址
                </label>
                <input
                  type="text"
                  id="company_address"
                  name="company_address"
                  value={settings.company_address}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="北京市朝阳区医疗科技园区"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 关于我们 */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-primary-600" />
              关于我们
            </h3>
          </div>
          <div className="card-body">
            <div>
              <label htmlFor="about_us" className="block text-sm font-medium text-gray-700 mb-2">
                公司介绍
              </label>
              <textarea
                id="about_us"
                name="about_us"
                value={settings.about_us}
                onChange={handleInputChange}
                rows={6}
                className="textarea"
                placeholder="我们是一家专业的医疗器械销售公司，致力于为医疗机构提供高品质的医疗设备和解决方案。"
              />
              <p className="mt-1 text-sm text-gray-500">
                支持HTML格式，将显示在关于我们页面
              </p>
            </div>
          </div>
        </div>

        {/* 保存按钮 */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex items-center disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? '保存中...' : '保存设置'}
          </button>
        </div>
      </form>

      {/* 其他设置 */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">其他设置</h3>
        </div>
        <div className="card-body">
          <div className="text-gray-600">
            <p>以下设置需要通过环境变量或配置文件进行修改：</p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>• JWT 密钥配置</li>
              <li>• 数据库连接设置</li>
              <li>• 文件上传限制</li>
              <li>• CORS 跨域设置</li>
              <li>• 邮件服务配置</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminSettings