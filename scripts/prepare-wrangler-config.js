#!/usr/bin/env node

/**
 * Wrangler 配置预处理脚本
 * 用于在部署前自动配置 D1 数据库 ID
 * 支持从以下来源读取 database_id（优先级从高到低）：
 * 1. 环境变量 D1_DATABASE_ID
 * 2. 从 wrangler d1 list 命令获取
 * 3. 自动创建新数据库（需要 Cloudflare 认证）
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WORKER_WRANGLER_PATH = path.join(__dirname, '../worker/wrangler.toml');
const ROOT_WRANGLER_PATH = path.join(__dirname, '../wrangler.toml');

function getDatabaseIdFromEnv() {
  return process.env.D1_DATABASE_ID || null;
}

function getDatabaseIdFromWrangler() {
  try {
    const output = execSync('wrangler d1 list', { 
      encoding: 'utf-8', 
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 10000
    });
    const match = output.match(/med-sales-db\s+\|\s+([a-f0-9\-]+)/);
    return match ? match[1] : null;
  } catch (error) {
    return null;
  }
}

function createDatabase() {
  try {
    console.log('🔨 Creating D1 database...');
    const output = execSync('wrangler d1 create med-sales-db', { 
      encoding: 'utf-8',
      timeout: 30000
    });
    
    const match = output.match(/database_id = "([a-f0-9\-]+)"/);
    if (match) {
      return match[1];
    }
  } catch (error) {
    console.log('⚠️  Could not create database automatically');
  }
  return null;
}

function updateWranglerConfig(filePath, databaseId) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  
  // 尝试替换各种格式的 database_id 行
  let updated = false;
  
  // 格式 1: # database_id = "" # 取消注释并填写实际的D1数据库ID
  if (/# database_id = "" # 取消注释并填写实际的D1数据库ID/.test(content)) {
    content = content.replace(
      /# database_id = "" # 取消注释并填写实际的D1数据库ID/,
      `database_id = "${databaseId}"`
    );
    updated = true;
  }
  // 格式 2: # database_id = ""
  else if (/# database_id = ""/.test(content)) {
    content = content.replace(
      /# database_id = ""/,
      `database_id = "${databaseId}"`
    );
    updated = true;
  }
  // 格式 3: 已有 database_id = "..." 但内容是占位符或空的
  else if (/database_id = "([^"]*)"/.test(content)) {
    const current = /database_id = "([^"]*)"/.exec(content);
    if (current && (current[1] === '' || current[1].includes('placeholder') || 
        current[1].includes('your-') || current[1] === 'd1-placeholder-id-will-be-replaced')) {
      content = content.replace(
        /database_id = "[^"]*"/,
        `database_id = "${databaseId}"`
      );
      updated = true;
    } else if (current && current[1].match(/^[a-f0-9\-]+$/)) {
      console.log(`✅ ${path.basename(filePath)} already has a valid database_id`);
      return true;
    }
  }
  
  if (updated) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ Updated ${path.basename(filePath)}`);
    return true;
  }
  
  // 最后检查是否已经有有效的 database_id
  if (/database_id = "[a-f0-9\-]+"/.test(content)) {
    console.log(`✅ ${path.basename(filePath)} already configured with valid ID`);
    return true;
  }
  
  return false;
}

function main() {
  console.log('🔧 Preparing Wrangler configuration...\n');
  
  let databaseId = getDatabaseIdFromEnv();
  
  if (databaseId) {
    console.log('📝 Found D1_DATABASE_ID from environment variable');
  } else {
    console.log('🔍 Checking existing D1 databases...');
    databaseId = getDatabaseIdFromWrangler();
    
    if (databaseId) {
      console.log(`✅ Found existing database: ${databaseId}`);
    } else {
      console.log('💡 No existing database found, attempting to create one...');
      databaseId = createDatabase();
      
      if (databaseId) {
        console.log(`✅ Created new database: ${databaseId}`);
      } else {
        console.log('❌ Could not create database automatically');
        console.log('\n📌 Deployment Instructions:');
        console.log('   1. Ensure you are logged in to Cloudflare:');
        console.log('      wrangler login');
        console.log('   2. Create D1 database manually:');
        console.log('      wrangler d1 create med-sales-db');
        console.log('   3. Copy the database_id from the output');
        console.log('   4. Set environment variable before deploying:');
        console.log('      export D1_DATABASE_ID=<your-database-id>');
        console.log('   5. Try deploying again:');
        console.log('      npm run deploy\n');
        process.exit(1);
      }
    }
  }
  
  console.log(`\nℹ️  Using database ID: ${databaseId}\n`);
  
  // 更新 wrangler.toml 文件
  updateWranglerConfig(WORKER_WRANGLER_PATH, databaseId);
  updateWranglerConfig(ROOT_WRANGLER_PATH, databaseId);
  
  console.log('\n✅ Wrangler configuration ready for deployment');
}

main();
