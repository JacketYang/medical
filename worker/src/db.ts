/**
 * 数据库操作工具类
 * 封装D1数据库操作，提供统一的查询接口
 */

export interface DatabaseResult {
  success: boolean;
  data?: any;
  error?: string;
  meta?: any;
}

/**
 * 执行数据库查询
 * @param env - Cloudflare Worker环境变量
 * @param sql - SQL查询语句
 * @param params - 查询参数
 * @returns 查询结果
 */
export async function queryDB(env: any, sql: string, params: any[] = []): Promise<DatabaseResult> {
  try {
    const stmt = env.DB.prepare(sql);
    const result = await stmt.bind(...params).all();
    
    return {
      success: true,
      data: result.results,
      meta: result.meta
    };
  } catch (error) {
    console.error('Database query error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Database query failed'
    };
  }
}

/**
 * 执行数据库查询（返回单条记录）
 * @param env - Cloudflare Worker环境变量
 * @param sql - SQL查询语句
 * @param params - 查询参数
 * @returns 查询结果
 */
export async function queryOneDB(env: any, sql: string, params: any[] = []): Promise<DatabaseResult> {
  try {
    const stmt = env.DB.prepare(sql);
    const result = await stmt.bind(...params).first();
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Database query error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Database query failed'
    };
  }
}

/**
 * 执行数据库写入操作
 * @param env - Cloudflare Worker环境变量
 * @param sql - SQL语句
 * @param params - 参数
 * @returns 执行结果
 */
export async function executeDB(env: any, sql: string, params: any[] = []): Promise<DatabaseResult> {
  try {
    const stmt = env.DB.prepare(sql);
    const result = await stmt.bind(...params).run();
    
    return {
      success: true,
      data: result,
      meta: result.meta
    };
  } catch (error) {
    console.error('Database execute error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Database execute failed'
    };
  }
}

/**
 * 获取分页数据
 * @param env - Cloudflare Worker环境变量
 * @param table - 表名
 * @param page - 页码
 * @param pageSize - 每页数量
 * @param where - WHERE条件
 * @param orderBy - 排序字段
 * @returns 分页数据
 */
export async function getPaginatedData(
  env: any, 
  table: string, 
  page: number = 1, 
  pageSize: number = 20,
  where: string = '1=1',
  orderBy: string = 'created_at DESC'
): Promise<DatabaseResult> {
  try {
    const offset = (page - 1) * pageSize;
    
    // 获取总数
    const countResult = await queryDB(env, `SELECT COUNT(*) as total FROM ${table} WHERE ${where}`);
    if (!countResult.success) {
      return countResult;
    }
    
    const total = countResult.data[0].total;
    
    // 获取数据
    const dataResult = await queryDB(
      env, 
      `SELECT * FROM ${table} WHERE ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
      [pageSize, offset]
    );
    
    if (!dataResult.success) {
      return dataResult;
    }
    
    return {
      success: true,
      data: {
        items: dataResult.data,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
          hasNext: page * pageSize < total,
          hasPrev: page > 1
        }
      }
    };
  } catch (error) {
    console.error('Paginated query error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Paginated query failed'
    };
  }
}