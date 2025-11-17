/**
 * 站点设置路由
 * 处理站点配置的读取和更新
 */

import { Hono } from 'hono';
import { queryDB, queryOneDB, executeDB } from '../db';
import { authMiddleware, createResponse } from '../utils';

const settingsRoutes = new Hono();

/**
 * 获取站点设置
 * GET /api/settings
 * 可选查询参数：keys (逗号分隔的设置键名)
 */
settingsRoutes.get('/', async (c) => {
  try {
    const keys = c.req.query('keys');
    
    let sql = 'SELECT setting_key, setting_value, description FROM site_settings';
    let params: any[] = [];
    
    if (keys) {
      const keyList = keys.split(',').map(key => key.trim());
      const placeholders = keyList.map(() => '?').join(',');
      sql += ` WHERE setting_key IN (${placeholders})`;
      params = keyList;
    }
    
    const result = await queryDB(c.env, sql, params);
    
    if (!result.success) {
      return c.json(createResponse(false, null, result.error), 500);
    }
    
    // 将设置转换为键值对对象
    const settings: Record<string, any> = {};
    result.data.forEach((setting: any) => {
      settings[setting.setting_key] = {
        value: setting.setting_value,
        description: setting.description
      };
    });
    
    return c.json(createResponse(true, settings));
    
  } catch (error) {
    console.error('Get settings error:', error);
    return c.json(createResponse(false, null, 'Failed to get settings'), 500);
  }
});

/**
 * 获取单个设置项
 * GET /api/settings/:key
 */
settingsRoutes.get('/:key', async (c) => {
  try {
    const key = c.req.param('key');
    
    const result = await queryOneDB(
      c.env,
      'SELECT setting_key, setting_value, description FROM site_settings WHERE setting_key = ?',
      [key]
    );
    
    if (!result.success) {
      return c.json(createResponse(false, null, result.error), 500);
    }
    
    if (!result.data) {
      return c.json(createResponse(false, null, 'Setting not found'), 404);
    }
    
    return c.json(createResponse(true, {
      key: result.data.setting_key,
      value: result.data.setting_value,
      description: result.data.description
    }));
    
  } catch (error) {
    console.error('Get setting error:', error);
    return c.json(createResponse(false, null, 'Failed to get setting'), 500);
  }
});

/**
 * 更新站点设置（需要认证）
 * PUT /api/settings/:key
 */
settingsRoutes.put('/:key', authMiddleware, async (c) => {
  try {
    const key = c.req.param('key');
    const body = await c.req.json();
    const { value, description } = body;
    
    if (value === undefined) {
      return c.json(createResponse(false, null, 'Setting value is required'), 400);
    }
    
    // 检查设置是否存在
    const existingResult = await queryOneDB(
      c.env,
      'SELECT id FROM site_settings WHERE setting_key = ?',
      [key]
    );
    
    if (!existingResult.success) {
      return c.json(createResponse(false, null, existingResult.error), 500);
    }
    
    if (existingResult.data) {
      // 更新现有设置
      const updateResult = await executeDB(
        c.env,
        'UPDATE site_settings SET setting_value = ?, description = COALESCE(?, description), updated_at = datetime(\'now\') WHERE setting_key = ?',
        [value, description, key]
      );
      
      if (!updateResult.success) {
        return c.json(createResponse(false, null, updateResult.error), 500);
      }
    } else {
      // 创建新设置
      const insertResult = await executeDB(
        c.env,
        'INSERT INTO site_settings (setting_key, setting_value, description, updated_at) VALUES (?, ?, ?, datetime(\'now\'))',
        [key, value, description || '']
      );
      
      if (!insertResult.success) {
        return c.json(createResponse(false, null, insertResult.error), 500);
      }
    }
    
    // 返回更新后的设置
    const updatedResult = await queryOneDB(
      c.env,
      'SELECT setting_key, setting_value, description FROM site_settings WHERE setting_key = ?',
      [key]
    );
    
    if (!updatedResult.success) {
      return c.json(createResponse(false, null, 'Failed to retrieve updated setting'), 500);
    }
    
    return c.json(createResponse(true, {
      key: updatedResult.data.setting_key,
      value: updatedResult.data.setting_value,
      description: updatedResult.data.description
    }));
    
  } catch (error) {
    console.error('Update setting error:', error);
    return c.json(createResponse(false, null, 'Failed to update setting'), 500);
  }
});

/**
 * 批量更新站点设置（需要认证）
 * PUT /api/settings
 * Body: { settings: { key1: value1, key2: value2, ... } }
 */
settingsRoutes.put('/', authMiddleware, async (c) => {
  try {
    const body = await c.req.json();
    const { settings } = body;
    
    if (!settings || typeof settings !== 'object') {
      return c.json(createResponse(false, null, 'Settings object is required'), 400);
    }
    
    const updatedSettings: any[] = [];
    const errors: string[] = [];
    
    // 逐个更新设置
    for (const [key, value] of Object.entries(settings)) {
      try {
        // 检查设置是否存在
        const existingResult = await queryOneDB(
          c.env,
          'SELECT id FROM site_settings WHERE setting_key = ?',
          [key]
        );
        
        if (existingResult.success) {
          if (existingResult.data) {
            // 更新现有设置
            const updateResult = await executeDB(
              c.env,
              'UPDATE site_settings SET setting_value = ?, updated_at = datetime(\'now\') WHERE setting_key = ?',
              [value, key]
            );
            
            if (updateResult.success) {
              updatedSettings.push({ key, value });
            } else {
              errors.push(`Failed to update ${key}: ${updateResult.error}`);
            }
          } else {
            // 创建新设置
            const insertResult = await executeDB(
              c.env,
              'INSERT INTO site_settings (setting_key, setting_value, updated_at) VALUES (?, ?, datetime(\'now\'))',
              [key, value]
            );
            
            if (insertResult.success) {
              updatedSettings.push({ key, value });
            } else {
              errors.push(`Failed to create ${key}: ${insertResult.error}`);
            }
          }
        } else {
          errors.push(`Database error for ${key}: ${existingResult.error}`);
        }
      } catch (error) {
        errors.push(`Error processing ${key}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    if (errors.length > 0) {
      return c.json(createResponse(false, null, `Some settings failed to update: ${errors.join(', ')}`), 500);
    }
    
    return c.json(createResponse(true, {
      updated: updatedSettings,
      message: `${updatedSettings.length} settings updated successfully`
    }));
    
  } catch (error) {
    console.error('Batch update settings error:', error);
    return c.json(createResponse(false, null, 'Failed to update settings'), 500);
  }
});

export { settingsRoutes };