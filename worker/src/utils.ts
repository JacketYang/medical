/**
 * 工具函数库
 * 包含JWT处理、CORS、文件验证等通用功能
 */

import { Context } from 'hono';

// JWT相关常量
const JWT_HEADER = { alg: 'HS256', typ: 'JWT' };

/**
 * 生成JWT Token
 * @param payload - JWT载荷
 * @param secret - 密钥
 * @returns JWT字符串
 */
export function generateJWT(payload: any, secret: string): string {
  const header = btoa(JSON.stringify(JWT_HEADER));
  const payloadStr = btoa(JSON.stringify(payload));
  
  // 简化的签名实现（生产环境建议使用专业JWT库）
  const signature = btoa(`${header}.${payloadStr}.${secret}`);
  
  return `${header}.${payloadStr}.${signature}`;
}

/**
 * 验证JWT Token
 * @param token - JWT字符串
 * @param secret - 密钥
 * @returns 验证结果
 */
export function verifyJWT(token: string, secret: string): { valid: boolean; payload?: any } {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false };
    }
    
    const [header, payload, signature] = parts;
    
    // 验证签名（简化实现）
    const expectedSignature = btoa(`${header}.${payload}.${secret}`);
    if (signature !== expectedSignature) {
      return { valid: false };
    }
    
    const decodedPayload = JSON.parse(atob(payload));
    
    // 检查过期时间
    if (decodedPayload.exp && decodedPayload.exp < Date.now() / 1000) {
      return { valid: false };
    }
    
    return { valid: true, payload: decodedPayload };
  } catch (error) {
    console.error('JWT verification error:', error);
    return { valid: false };
  }
}

/**
 * 认证中间件
 * 检查请求头中的JWT Token
 */
export async function authMiddleware(c: Context, next: () => Promise<void>) {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ 
      success: false, 
      error: 'Authorization token required' 
    }, 401);
  }
  
  const token = authHeader.substring(7);
  const jwtSecret = c.env.JWT_SECRET;
  
  if (!jwtSecret) {
    console.error('JWT_SECRET not configured');
    return c.json({ 
      success: false, 
      error: 'Server configuration error' 
    }, 500);
  }
  
  const verification = verifyJWT(token, jwtSecret);
  
  if (!verification.valid) {
    return c.json({ 
      success: false, 
      error: 'Invalid or expired token' 
    }, 401);
  }
  
  // 将用户信息添加到上下文
  c.set('user', verification.payload);
  await next();
}

/**
 * 生成URL友好的slug
 * @param text - 原始文本
 * @returns slug字符串
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * 验证文件类型
 * @param filename - 文件名
 * @param contentType - MIME类型
 * @returns 是否为允许的类型
 */
export function validateFileType(filename: string, contentType: string): boolean {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/svg+xml'
  ];
  
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.svg'];
  const fileExtension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  
  return allowedTypes.includes(contentType) && allowedExtensions.includes(fileExtension);
}

/**
 * 验证文件大小
 * @param size - 文件大小（字节）
 * @param maxSize - 最大允许大小（字节）
 * @returns 是否在允许范围内
 */
export function validateFileSize(size: number, maxSize: number = 5 * 1024 * 1024): boolean {
  return size <= maxSize;
}

/**
 * 生成随机字符串
 * @param length - 字符串长度
 * @returns 随机字符串
 */
export function generateRandomString(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 统一API响应格式
 */
export function createResponse(success: boolean, data?: any, error?: string, status: number = 200) {
  const response: any = { success };
  
  if (success && data !== undefined) {
    response.data = data;
  }
  
  if (!success && error) {
    response.error = error;
  }
  
  return response;
}

/**
 * 分页参数验证和标准化
 */
export function normalizePagination(page?: string, pageSize?: string) {
  const pageNum = Math.max(1, parseInt(page || '1'));
  const pageSizeNum = Math.min(100, Math.max(1, parseInt(pageSize || '20')));
  
  return { page: pageNum, pageSize: pageSizeNum };
}