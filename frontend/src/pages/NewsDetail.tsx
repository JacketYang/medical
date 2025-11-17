/**
 * 新闻详情页面
 * 展示单篇文章的详细内容
 */

import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft, Calendar, User, Share2, Facebook, Twitter, Linkedin } from 'lucide-react'
import { postsApi, Post } from '../api/api'

const NewsDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([])

  useEffect(() => {
    const loadPost = async () => {
      if (!slug) return

      try {
        const response = await postsApi.getPost(slug)
        if (response.success && response.data) {
          setPost(response.data)
          
          // 加载相关文章（这里简化处理，实际应该根据分类或标签推荐）
          const relatedResponse = await postsApi.getPosts({ pageSize: 3 })
          if (relatedResponse.success && relatedResponse.data) {
            setRelatedPosts(relatedResponse.data.items.filter(p => p.id !== response.data?.id))
          }
        } else {
          setError('文章未找到')
        }
      } catch (error) {
        console.error('Failed to load post:', error)
        setError('加载文章失败')
      } finally {
        setLoading(false)
      }
    }

    loadPost()
  }, [slug])

  const shareToSocial = (platform: string) => {
    if (!post) return
    
    const url = window.location.href
    const title = post.title
    
    let shareUrl = ''
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        break
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
        break
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
        break
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{error || '文章未找到'}</h1>
          <Link to="/news" className="btn-primary">
            返回新闻列表
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>{post.title} - 新闻资讯 - 医疗器械销售官网</title>
        <meta name="description" content={post.summary} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.summary} />
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={post.created_at} />
        <meta property="article:author" content={post.author} />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 面包屑导航 */}
        <nav className="breadcrumb mb-8">
          <Link to="/" className="breadcrumb-item">首页</Link>
          <span className="breadcrumb-separator">/</span>
          <Link to="/news" className="breadcrumb-item">新闻资讯</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="text-gray-900 line-clamp-1">{post.title}</span>
        </nav>

        {/* 返回按钮 */}
        <div className="mb-8">
          <Link
            to="/news"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回新闻列表
          </Link>
        </div>

        {/* 文章内容 */}
        <article className="card">
          <div className="card-body">
            {/* 文章标题 */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              {post.title}
            </h1>

            {/* 文章元信息 */}
            <div className="flex flex-wrap items-center text-sm text-gray-600 mb-8 pb-6 border-b border-gray-200">
              <div className="flex items-center mr-6 mb-2">
                <User className="h-4 w-4 mr-2" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center mr-6 mb-2">
                <Calendar className="h-4 w-4 mr-2" />
                <time>{new Date(post.created_at).toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</time>
              </div>
              
              {/* 分享按钮 */}
              <div className="flex items-center space-x-2 ml-auto">
                <span className="text-gray-500">分享：</span>
                <button
                  onClick={() => shareToSocial('facebook')}
                  className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                  title="分享到 Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </button>
                <button
                  onClick={() => shareToSocial('twitter')}
                  className="p-2 text-gray-500 hover:text-blue-400 transition-colors"
                  title="分享到 Twitter"
                >
                  <Twitter className="h-4 w-4" />
                </button>
                <button
                  onClick={() => shareToSocial('linkedin')}
                  className="p-2 text-gray-500 hover:text-blue-700 transition-colors"
                  title="分享到 LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* 文章摘要 */}
            {post.summary && (
              <div className="bg-primary-50 border-l-4 border-primary-500 p-4 mb-8">
                <p className="text-gray-700 italic">{post.summary}</p>
              </div>
            )}

            {/* 文章正文 */}
            <div 
              className="prose prose-lg max-w-none prose-gray mb-8"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* 文章标签（可选） */}
            <div className="flex flex-wrap gap-2 pt-6 border-t border-gray-200">
              <span className="text-sm text-gray-500">标签：</span>
              {['医疗器械', '行业动态', '技术创新'].map((tag) => (
                <span
                  key={tag}
                  className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </article>

        {/* 相关文章 */}
        {relatedPosts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">相关文章</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost) => (
                <article key={relatedPost.id} className="card hover:shadow-lg transition-shadow">
                  <div className="card-body">
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <Calendar className="h-4 w-4 mr-1" />
                      <time>{new Date(relatedPost.created_at).toLocaleDateString('zh-CN')}</time>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      <Link to={`/news/${relatedPost.slug}`} className="hover:text-primary-600 transition-colors">
                        {relatedPost.title}
                      </Link>
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{relatedPost.summary}</p>
                    <Link
                      to={`/news/${relatedPost.slug}`}
                      className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                    >
                      阅读更多 →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default NewsDetail