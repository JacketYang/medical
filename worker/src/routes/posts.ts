/**
 * 文章/新闻管理路由
 * 处理文章的CRUD操作
 */

import { Hono } from 'hono';
import { queryDB, queryOneDB, executeDB, getPaginatedData } from '../db';
import { authMiddleware, createResponse, generateSlug, normalizePagination } from '../utils';

const postRoutes = new Hono();

/**
 * 获取文章列表
 * GET /api/posts
 * Query: page, pageSize, status
 */
postRoutes.get('/', async (c) => {
  try {
    const { page, pageSize } = normalizePagination(
      c.req.query('page'),
      c.req.query('pageSize')
    );
    
    const status = c.req.query('status') || 'published';
    
    // 构建WHERE条件
    const whereClause = 'status = ?';
    const params = [status];
    
    // 获取分页数据
    const result = await getPaginatedData(
      c.env,
      'posts',
      page,
      pageSize,
      whereClause,
      'featured DESC, created_at DESC'
    );
    
    if (!result.success) {
      return c.json(createResponse(false, null, result.error), 500);
    }
    
    return c.json(createResponse(true, result.data));
    
  } catch (error) {
    console.error('Get posts error:', error);
    return c.json(createResponse(false, null, 'Failed to get posts'), 500);
  }
});

/**
 * 获取单个文章详情
 * GET /api/posts/:id
 */
postRoutes.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    // 支持ID或slug查询
    const isNumeric = /^\d+$/.test(id);
    const field = isNumeric ? 'id' : 'slug';
    
    const result = await queryOneDB(
      c.env,
      `SELECT * FROM posts WHERE ${field} = ? AND status = ?`,
      [id, 'published']
    );
    
    if (!result.success) {
      return c.json(createResponse(false, null, result.error), 500);
    }
    
    if (!result.data) {
      return c.json(createResponse(false, null, 'Post not found'), 404);
    }
    
    return c.json(createResponse(true, result.data));
    
  } catch (error) {
    console.error('Get post error:', error);
    return c.json(createResponse(false, null, 'Failed to get post'), 500);
  }
});

/**
 * 创建文章（需要认证）
 * POST /api/posts
 */
postRoutes.post('/', authMiddleware, async (c) => {
  try {
    const body = await c.req.json();
    const { title, summary, content, author, featured, status } = body;
    
    if (!title) {
      return c.json(createResponse(false, null, 'Post title is required'), 400);
    }
    
    // 生成slug
    const slug = generateSlug(title);
    
    // 检查slug是否已存在
    const existingResult = await queryOneDB(
      c.env,
      'SELECT id FROM posts WHERE slug = ?',
      [slug]
    );
    
    if (existingResult.success && existingResult.data) {
      return c.json(createResponse(false, null, 'Post with this title already exists'), 400);
    }
    
    // 插入文章
    const insertResult = await executeDB(
      c.env,
      `INSERT INTO posts (slug, title, summary, content, author, featured, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        slug,
        title,
        summary || '',
        content || '',
        author || 'Admin',
        featured ? 1 : 0,
        status || 'published'
      ]
    );
    
    if (!insertResult.success) {
      return c.json(createResponse(false, null, insertResult.error), 500);
    }
    
    // 返回创建的文章
    const newPostResult = await queryOneDB(
      c.env,
      'SELECT * FROM posts WHERE id = ?',
      [insertResult.data.meta.last_row_id]
    );
    
    if (!newPostResult.success) {
      return c.json(createResponse(false, null, 'Failed to retrieve created post'), 500);
    }
    
    return c.json(createResponse(true, newPostResult.data), 201);
    
  } catch (error) {
    console.error('Create post error:', error);
    return c.json(createResponse(false, null, 'Failed to create post'), 500);
  }
});

/**
 * 更新文章（需要认证）
 * PUT /api/posts/:id
 */
postRoutes.put('/:id', authMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { title, summary, content, author, featured, status } = body;
    
    // 检查文章是否存在
    const existingResult = await queryOneDB(
      c.env,
      'SELECT * FROM posts WHERE id = ?',
      [id]
    );
    
    if (!existingResult.success) {
      return c.json(createResponse(false, null, existingResult.error), 500);
    }
    
    if (!existingResult.data) {
      return c.json(createResponse(false, null, 'Post not found'), 404);
    }
    
    // 如果更新了标题，需要重新生成slug
    let slug = existingResult.data.slug;
    if (title && title !== existingResult.data.title) {
      slug = generateSlug(title);
      
      // 检查新slug是否冲突
      const slugCheckResult = await queryOneDB(
        c.env,
        'SELECT id FROM posts WHERE slug = ? AND id != ?',
        [slug, id]
      );
      
      if (slugCheckResult.success && slugCheckResult.data) {
        return c.json(createResponse(false, null, 'Post with this title already exists'), 400);
      }
    }
    
    // 更新文章
    const updateResult = await executeDB(
      c.env,
      `UPDATE posts SET 
       slug = COALESCE(?, slug),
       title = COALESCE(?, title),
       summary = COALESCE(?, summary),
       content = COALESCE(?, content),
       author = COALESCE(?, author),
       featured = COALESCE(?, featured),
       status = COALESCE(?, status),
       updated_at = datetime('now')
       WHERE id = ?`,
      [
        title ? slug : undefined,
        title,
        summary,
        content,
        author,
        featured !== undefined ? (featured ? 1 : 0) : undefined,
        status,
        id
      ]
    );
    
    if (!updateResult.success) {
      return c.json(createResponse(false, null, updateResult.error), 500);
    }
    
    // 返回更新后的文章
    const updatedPostResult = await queryOneDB(
      c.env,
      'SELECT * FROM posts WHERE id = ?',
      [id]
    );
    
    if (!updatedPostResult.success) {
      return c.json(createResponse(false, null, 'Failed to retrieve updated post'), 500);
    }
    
    return c.json(createResponse(true, updatedPostResult.data));
    
  } catch (error) {
    console.error('Update post error:', error);
    return c.json(createResponse(false, null, 'Failed to update post'), 500);
  }
});

/**
 * 删除文章（需要认证）
 * DELETE /api/posts/:id
 */
postRoutes.delete('/:id', authMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    
    // 检查文章是否存在
    const existingResult = await queryOneDB(
      c.env,
      'SELECT id FROM posts WHERE id = ?',
      [id]
    );
    
    if (!existingResult.success) {
      return c.json(createResponse(false, null, existingResult.error), 500);
    }
    
    if (!existingResult.data) {
      return c.json(createResponse(false, null, 'Post not found'), 404);
    }
    
    // 删除文章
    const deleteResult = await executeDB(
      c.env,
      'DELETE FROM posts WHERE id = ?',
      [id]
    );
    
    if (!deleteResult.success) {
      return c.json(createResponse(false, null, deleteResult.error), 500);
    }
    
    return c.json(createResponse(true, { message: 'Post deleted successfully' }));
    
  } catch (error) {
    console.error('Delete post error:', error);
    return c.json(createResponse(false, null, 'Failed to delete post'), 500);
  }
});

export { postRoutes };