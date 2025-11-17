/**
 * Worker入口文件 - 路由分发和中间件配置
 * 为医疗器械销售官网提供REST API服务
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { authRoutes } from './routes/auth';
import { productRoutes } from './routes/products';
import { postRoutes } from './routes/posts';
import { settingsRoutes } from './routes/settings';
import { uploadRoutes } from './routes/upload';

// 创建Hono应用实例
const app = new Hono();

// 全局中间件配置
app.use('*', logger()); // 请求日志
app.use('*', cors({
  origin: ['http://localhost:5173', 'https://your-domain.com'], // 允许的前端域名
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// 健康检查端点
app.get('/', (c) => {
  return c.json({ 
    success: true, 
    message: 'Medical Sales API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API路由注册
app.route('/api/auth', authRoutes);
app.route('/api/products', productRoutes);
app.route('/api/posts', postRoutes);
app.route('/api/settings', settingsRoutes);
app.route('/api/upload', uploadRoutes);

// 404处理
app.notFound((c) => {
  return c.json({ 
    success: false, 
    error: 'API endpoint not found' 
  }, 404);
});

// 全局错误处理
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({ 
    success: false, 
    error: 'Internal server error' 
  }, 500);
});

export default app;