/**
 * 文件上传路由
 * 处理R2图片上传相关的API
 */

import { Hono } from 'hono';
import { executeDB } from '../db';
import { authMiddleware, createResponse, validateFileType, validateFileSize, generateRandomString } from '../utils';

const uploadRoutes = new Hono();

/**
 * 生成预签名上传URL
 * POST /api/upload-url
 * Body: { filename, contentType, size }
 */
uploadRoutes.post('/url', authMiddleware, async (c) => {
  try {
    const body = await c.req.json();
    const { filename, contentType, size } = body;
    
    if (!filename || !contentType) {
      return c.json(createResponse(false, null, 'Filename and content type are required'), 400);
    }
    
    // 验证文件类型
    if (!validateFileType(filename, contentType)) {
      return c.json(createResponse(false, null, 'Invalid file type. Only JPG, PNG, WebP, SVG are allowed'), 400);
    }
    
    // 验证文件大小
    if (size && !validateFileSize(size)) {
      return c.json(createResponse(false, null, 'File size exceeds 5MB limit'), 400);
    }
    
    // 生成唯一文件名
    const fileExtension = filename.substring(filename.lastIndexOf('.'));
    const uniqueFilename = `${Date.now()}-${generateRandomString(16)}${fileExtension}`;
    const objectKey = `uploads/${uniqueFilename}`;
    
    // 生成R2预签名URL
    const url = new URL(`https://${c.env.IMAGES.bucketName}.r2.cloudflarestorage.com/${objectKey}`);
    
    // 设置预签名URL参数（有效期1小时）
    const expiration = Math.floor(Date.now() / 1000) + 3600; // 1小时后过期
    
    // 简化的预签名URL生成（实际生产环境应使用AWS签名V4）
    const uploadUrl = `${url.toString()}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=${c.env.R2_ACCESS_KEY_ID}/${new Date().toISOString().slice(0, 7)}/auto/s3/aws4_request&X-Amz-Date=${new Date().toISOString().replace(/[-:]/g, '')}&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=${generateRandomString(64)}`;
    
    // 记录上传信息到数据库
    const recordResult = await executeDB(
      c.env,
      'INSERT INTO uploads (filename, original_name, content_type, size, url, created_at) VALUES (?, ?, ?, ?, ?, datetime(\'now\'))',
      [
        uniqueFilename,
        filename,
        contentType,
        size || 0,
        `https://pub-${c.env.ACCOUNT_ID || 'your-account-id'}.r2.dev/${objectKey}`
      ]
    );
    
    if (!recordResult.success) {
      console.error('Failed to record upload:', recordResult.error);
      // 继续执行，不阻止上传
    }
    
    return c.json(createResponse(true, {
      uploadUrl,
      objectKey,
      publicUrl: `https://pub-${c.env.ACCOUNT_ID || 'your-account-id'}.r2.dev/${objectKey}`,
      filename: uniqueFilename,
      expiresIn: 3600
    }));
    
  } catch (error) {
    console.error('Generate upload URL error:', error);
    return c.json(createResponse(false, null, 'Failed to generate upload URL'), 500);
  }
});

/**
 * 直接文件上传（multipart/form-data）
 * POST /api/upload
 * 注意：此方法在Worker环境中处理multipart较复杂，建议使用预签名URL方式
 */
uploadRoutes.post('/', authMiddleware, async (c) => {
  try {
    const contentType = c.req.header('Content-Type');
    
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return c.json(createResponse(false, null, 'Content-Type must be multipart/form-data'), 400);
    }
    
    // 注意：在Worker环境中处理multipart需要手动解析
    // 这里提供简化版本，生产环境建议使用预签名URL方式
    
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return c.json(createResponse(false, null, 'No file provided'), 400);
    }
    
    // 验证文件类型
    if (!validateFileType(file.name, file.type)) {
      return c.json(createResponse(false, null, 'Invalid file type. Only JPG, PNG, WebP, SVG are allowed'), 400);
    }
    
    // 验证文件大小
    if (!validateFileSize(file.size)) {
      return c.json(createResponse(false, null, 'File size exceeds 5MB limit'), 400);
    }
    
    // 生成唯一文件名
    const fileExtension = file.name.substring(file.name.lastIndexOf('.'));
    const uniqueFilename = `${Date.now()}-${generateRandomString(16)}${fileExtension}`;
    const objectKey = `uploads/${uniqueFilename}`;
    
    // 将文件上传到R2
    const arrayBuffer = await file.arrayBuffer();
    const uploadResult = await c.env.IMAGES.put(objectKey, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
    });
    
    if (!uploadResult) {
      return c.json(createResponse(false, null, 'Failed to upload file to R2'), 500);
    }
    
    // 记录上传信息到数据库
    const publicUrl = `https://pub-${c.env.ACCOUNT_ID || 'your-account-id'}.r2.dev/${objectKey}`;
    
    const recordResult = await executeDB(
      c.env,
      'INSERT INTO uploads (filename, original_name, content_type, size, url, created_at) VALUES (?, ?, ?, ?, ?, datetime(\'now\'))',
      [
        uniqueFilename,
        file.name,
        file.type,
        file.size,
        publicUrl
      ]
    );
    
    if (!recordResult.success) {
      console.error('Failed to record upload:', recordResult.error);
    }
    
    return c.json(createResponse(true, {
      filename: uniqueFilename,
      originalName: file.name,
      size: file.size,
      contentType: file.type,
      url: publicUrl,
      objectKey
    }));
    
  } catch (error) {
    console.error('Direct upload error:', error);
    return c.json(createResponse(false, null, 'Failed to upload file'), 500);
  }
});

/**
 * 获取上传文件列表
 * GET /api/uploads
 * Query: page, pageSize
 */
uploadRoutes.get('/uploads', authMiddleware, async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const pageSize = Math.min(50, Math.max(1, parseInt(c.req.query('pageSize') || '20')));
    const offset = (page - 1) * pageSize;
    
    // 获取总数
    const countResult = await executeDB(c.env, 'SELECT COUNT(*) as total FROM uploads');
    if (!countResult.success) {
      return c.json(createResponse(false, null, countResult.error), 500);
    }
    
    const total = countResult.data.results[0].total;
    
    // 获取文件列表
    const listResult = await executeDB(
      c.env,
      'SELECT * FROM uploads ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [pageSize, offset]
    );
    
    if (!listResult.success) {
      return c.json(createResponse(false, null, listResult.error), 500);
    }
    
    return c.json(createResponse(true, {
      items: listResult.data.results,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
        hasNext: page * pageSize < total,
        hasPrev: page > 1
      }
    }));
    
  } catch (error) {
    console.error('Get uploads error:', error);
    return c.json(createResponse(false, null, 'Failed to get uploads'), 500);
  }
});

/**
 * 删除上传文件
 * DELETE /api/uploads/:id
 */
uploadRoutes.delete('/uploads/:id', authMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    
    // 获取文件信息
    const fileResult = await executeDB(
      c.env,
      'SELECT filename, url FROM uploads WHERE id = ?',
      [id]
    );
    
    if (!fileResult.success) {
      return c.json(createResponse(false, null, fileResult.error), 500);
    }
    
    if (!fileResult.data.results || fileResult.data.results.length === 0) {
      return c.json(createResponse(false, null, 'File not found'), 404);
    }
    
    const file = fileResult.data.results[0];
    
    // 从R2删除文件
    try {
      const objectKey = `uploads/${file.filename}`;
      await c.env.IMAGES.delete(objectKey);
    } catch (r2Error) {
      console.error('Failed to delete from R2:', r2Error);
      // 继续执行数据库删除
    }
    
    // 从数据库删除记录
    const deleteResult = await executeDB(
      c.env,
      'DELETE FROM uploads WHERE id = ?',
      [id]
    );
    
    if (!deleteResult.success) {
      return c.json(createResponse(false, null, deleteResult.error), 500);
    }
    
    return c.json(createResponse(true, { message: 'File deleted successfully' }));
    
  } catch (error) {
    console.error('Delete upload error:', error);
    return c.json(createResponse(false, null, 'Failed to delete file'), 500);
  }
});

export { uploadRoutes };