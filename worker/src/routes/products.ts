/**
 * 产品管理路由
 * 处理产品的CRUD操作
 */

import { Hono } from 'hono';
import { queryDB, queryOneDB, executeDB, getPaginatedData } from '../db';
import { authMiddleware, createResponse, generateSlug, normalizePagination } from '../utils';

const productRoutes = new Hono();

/**
 * 获取产品列表
 * GET /api/products
 * Query: page, pageSize, q (搜索), category (分类)
 */
productRoutes.get('/', async (c) => {
  try {
    const { page, pageSize } = normalizePagination(
      c.req.query('page'),
      c.req.query('pageSize')
    );
    
    const search = c.req.query('q') || '';
    const category = c.req.query('category') || '';
    
    // 构建WHERE条件
    let whereConditions = ['status = ?', '1']; // status = 'active'
    let params: any[] = ['active'];
    
    if (search) {
      whereConditions.push('(name LIKE ? OR summary LIKE ?)');
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern);
    }
    
    if (category) {
      whereConditions.push('category = ?');
      params.push(category);
    }
    
    const whereClause = whereConditions.join(' AND ');
    
    // 添加搜索条件到分页查询
    const result = await getPaginatedData(
      c.env,
      'products',
      page,
      pageSize,
      whereClause,
      'featured DESC, created_at DESC'
    );
    
    if (!result.success) {
      return c.json(createResponse(false, null, result.error), 500);
    }
    
    // 处理图片和规格JSON字段
    const items = result.data.items.map((product: any) => ({
      ...product,
      images: typeof product.images === 'string' ? JSON.parse(product.images) : product.images,
      specs: typeof product.specs === 'string' ? JSON.parse(product.specs) : product.specs
    }));
    
    return c.json(createResponse(true, {
      ...result.data,
      items
    }));
    
  } catch (error) {
    console.error('Get products error:', error);
    return c.json(createResponse(false, null, 'Failed to get products'), 500);
  }
});

/**
 * 获取单个产品详情
 * GET /api/products/:id
 */
productRoutes.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    // 支持ID或slug查询
    const isNumeric = /^\d+$/.test(id);
    const field = isNumeric ? 'id' : 'slug';
    
    const result = await queryOneDB(
      c.env,
      `SELECT * FROM products WHERE ${field} = ? AND status = ?`,
      [id, 'active']
    );
    
    if (!result.success) {
      return c.json(createResponse(false, null, result.error), 500);
    }
    
    if (!result.data) {
      return c.json(createResponse(false, null, 'Product not found'), 404);
    }
    
    // 处理JSON字段
    const product = {
      ...result.data,
      images: typeof result.data.images === 'string' ? JSON.parse(result.data.images) : result.data.images,
      specs: typeof result.data.specs === 'string' ? JSON.parse(result.data.specs) : result.data.specs
    };
    
    return c.json(createResponse(true, product));
    
  } catch (error) {
    console.error('Get product error:', error);
    return c.json(createResponse(false, null, 'Failed to get product'), 500);
  }
});

/**
 * 创建产品（需要认证）
 * POST /api/products
 */
productRoutes.post('/', authMiddleware, async (c) => {
  try {
    const body = await c.req.json();
    const { name, summary, description, price, category, images, specs, featured } = body;
    
    if (!name) {
      return c.json(createResponse(false, null, 'Product name is required'), 400);
    }
    
    // 生成slug
    const slug = generateSlug(name);
    
    // 检查slug是否已存在
    const existingResult = await queryOneDB(
      c.env,
      'SELECT id FROM products WHERE slug = ?',
      [slug]
    );
    
    if (existingResult.success && existingResult.data) {
      return c.json(createResponse(false, null, 'Product with this name already exists'), 400);
    }
    
    // 插入产品
    const insertResult = await executeDB(
      c.env,
      `INSERT INTO products (slug, name, summary, description, price, category, images, specs, featured, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        slug,
        name,
        summary || '',
        description || '',
        price || 0,
        category || '',
        JSON.stringify(images || []),
        JSON.stringify(specs || {}),
        featured ? 1 : 0,
        'active'
      ]
    );
    
    if (!insertResult.success) {
      return c.json(createResponse(false, null, insertResult.error), 500);
    }
    
    // 返回创建的产品
    const newProductResult = await queryOneDB(
      c.env,
      'SELECT * FROM products WHERE id = ?',
      [insertResult.data.meta.last_row_id]
    );
    
    if (!newProductResult.success) {
      return c.json(createResponse(false, null, 'Failed to retrieve created product'), 500);
    }
    
    const product = {
      ...newProductResult.data,
      images: typeof newProductResult.data.images === 'string' ? JSON.parse(newProductResult.data.images) : newProductResult.data.images,
      specs: typeof newProductResult.data.specs === 'string' ? JSON.parse(newProductResult.data.specs) : newProductResult.data.specs
    };
    
    return c.json(createResponse(true, product), 201);
    
  } catch (error) {
    console.error('Create product error:', error);
    return c.json(createResponse(false, null, 'Failed to create product'), 500);
  }
});

/**
 * 更新产品（需要认证）
 * PUT /api/products/:id
 */
productRoutes.put('/:id', authMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { name, summary, description, price, category, images, specs, featured, status } = body;
    
    // 检查产品是否存在
    const existingResult = await queryOneDB(
      c.env,
      'SELECT * FROM products WHERE id = ?',
      [id]
    );
    
    if (!existingResult.success) {
      return c.json(createResponse(false, null, existingResult.error), 500);
    }
    
    if (!existingResult.data) {
      return c.json(createResponse(false, null, 'Product not found'), 404);
    }
    
    // 如果更新了名称，需要重新生成slug
    let slug = existingResult.data.slug;
    if (name && name !== existingResult.data.name) {
      slug = generateSlug(name);
      
      // 检查新slug是否冲突
      const slugCheckResult = await queryOneDB(
        c.env,
        'SELECT id FROM products WHERE slug = ? AND id != ?',
        [slug, id]
      );
      
      if (slugCheckResult.success && slugCheckResult.data) {
        return c.json(createResponse(false, null, 'Product with this name already exists'), 400);
      }
    }
    
    // 更新产品
    const updateResult = await executeDB(
      c.env,
      `UPDATE products SET 
       slug = COALESCE(?, slug),
       name = COALESCE(?, name),
       summary = COALESCE(?, summary),
       description = COALESCE(?, description),
       price = COALESCE(?, price),
       category = COALESCE(?, category),
       images = COALESCE(?, images),
       specs = COALESCE(?, specs),
       featured = COALESCE(?, featured),
       status = COALESCE(?, status),
       updated_at = datetime('now')
       WHERE id = ?`,
      [
        name ? slug : undefined,
        name,
        summary,
        description,
        price,
        category,
        images !== undefined ? JSON.stringify(images) : undefined,
        specs !== undefined ? JSON.stringify(specs) : undefined,
        featured !== undefined ? (featured ? 1 : 0) : undefined,
        status,
        id
      ]
    );
    
    if (!updateResult.success) {
      return c.json(createResponse(false, null, updateResult.error), 500);
    }
    
    // 返回更新后的产品
    const updatedProductResult = await queryOneDB(
      c.env,
      'SELECT * FROM products WHERE id = ?',
      [id]
    );
    
    if (!updatedProductResult.success) {
      return c.json(createResponse(false, null, 'Failed to retrieve updated product'), 500);
    }
    
    const product = {
      ...updatedProductResult.data,
      images: typeof updatedProductResult.data.images === 'string' ? JSON.parse(updatedProductResult.data.images) : updatedProductResult.data.images,
      specs: typeof updatedProductResult.data.specs === 'string' ? JSON.parse(updatedProductResult.data.specs) : updatedProductResult.data.specs
    };
    
    return c.json(createResponse(true, product));
    
  } catch (error) {
    console.error('Update product error:', error);
    return c.json(createResponse(false, null, 'Failed to update product'), 500);
  }
});

/**
 * 删除产品（需要认证）
 * DELETE /api/products/:id
 */
productRoutes.delete('/:id', authMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    
    // 检查产品是否存在
    const existingResult = await queryOneDB(
      c.env,
      'SELECT id FROM products WHERE id = ?',
      [id]
    );
    
    if (!existingResult.success) {
      return c.json(createResponse(false, null, existingResult.error), 500);
    }
    
    if (!existingResult.data) {
      return c.json(createResponse(false, null, 'Product not found'), 404);
    }
    
    // 删除产品
    const deleteResult = await executeDB(
      c.env,
      'DELETE FROM products WHERE id = ?',
      [id]
    );
    
    if (!deleteResult.success) {
      return c.json(createResponse(false, null, deleteResult.error), 500);
    }
    
    return c.json(createResponse(true, { message: 'Product deleted successfully' }));
    
  } catch (error) {
    console.error('Delete product error:', error);
    return c.json(createResponse(false, null, 'Failed to delete product'), 500);
  }
});

export { productRoutes };