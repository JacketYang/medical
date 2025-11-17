/**
 * 认证路由
 * 处理用户登录、JWT生成等功能
 */

import { Hono } from 'hono';
import { queryOneDB, executeDB } from '../db';
import { generateJWT, createResponse } from '../utils';
import bcrypt from 'bcryptjs'; // 注意：需要在Worker环境中测试bcryptjs兼容性

const authRoutes = new Hono();

/**
 * 用户登录
 * POST /api/auth/login
 * Body: { username, password }
 */
authRoutes.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    const { username, password } = body;
    
    if (!username || !password) {
      return c.json(createResponse(false, null, 'Username and password are required'), 400);
    }
    
    // 查询用户
    const userResult = await queryOneDB(
      c.env,
      'SELECT id, username, password_hash, role FROM users WHERE username = ?',
      [username]
    );
    
    if (!userResult.success || !userResult.data) {
      return c.json(createResponse(false, null, 'Invalid credentials'), 401);
    }
    
    const user = userResult.data;
    
    // 验证密码（简化版，生产环境应使用bcrypt）
    let isPasswordValid = false;
    if (c.env.ADMIN_USERNAME === username && c.env.ADMIN_PASSWORD === password) {
      // 使用环境变量中的管理员账号
      isPasswordValid = true;
    } else {
      // 使用数据库中的用户（需要bcrypt验证）
      try {
        // 注意：bcryptjs在Worker环境中的兼容性
        // 这里简化处理，生产环境需要适当的密码验证库
        isPasswordValid = user.password_hash === password; // 临时简化处理
      } catch (error) {
        console.error('Password verification error:', error);
        isPasswordValid = false;
      }
    }
    
    if (!isPasswordValid) {
      return c.json(createResponse(false, null, 'Invalid credentials'), 401);
    }
    
    // 生成JWT
    const jwtSecret = c.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET not configured');
      return c.json(createResponse(false, null, 'Server configuration error'), 500);
    }
    
    const tokenPayload = {
      userId: user.id,
      username: user.username,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24小时过期
    };
    
    const token = generateJWT(tokenPayload, jwtSecret);
    
    return c.json(createResponse(true, {
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    }));
    
  } catch (error) {
    console.error('Login error:', error);
    return c.json(createResponse(false, null, 'Login failed'), 500);
  }
});

/**
 * 验证Token
 * POST /api/auth/verify
 * Headers: Authorization: Bearer <token>
 */
authRoutes.post('/verify', async (c) => {
  try {
    const user = c.get('user');
    
    if (!user) {
      return c.json(createResponse(false, null, 'Invalid token'), 401);
    }
    
    return c.json(createResponse(true, {
      user: {
        id: user.userId,
        username: user.username,
        role: user.role
      }
    }));
    
  } catch (error) {
    console.error('Token verification error:', error);
    return c.json(createResponse(false, null, 'Token verification failed'), 500);
  }
});

/**
 * 刷新Token
 * POST /api/auth/refresh
 * Headers: Authorization: Bearer <token>
 */
authRoutes.post('/refresh', async (c) => {
  try {
    const user = c.get('user');
    
    if (!user) {
      return c.json(createResponse(false, null, 'Invalid token'), 401);
    }
    
    // 生成新的JWT
    const jwtSecret = c.env.JWT_SECRET;
    if (!jwtSecret) {
      return c.json(createResponse(false, null, 'Server configuration error'), 500);
    }
    
    const tokenPayload = {
      userId: user.userId,
      username: user.username,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24小时过期
    };
    
    const newToken = generateJWT(tokenPayload, jwtSecret);
    
    return c.json(createResponse(true, {
      token: newToken
    }));
    
  } catch (error) {
    console.error('Token refresh error:', error);
    return c.json(createResponse(false, null, 'Token refresh failed'), 500);
  }
});

export { authRoutes };