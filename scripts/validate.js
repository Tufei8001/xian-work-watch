#!/usr/bin/env node
/**
 * data/xian/all.md 格式校验
 * 检查每条记录是否符合: 公司名 | 区 | 标签 | 时间 | 描述 | 证据
 * 
 * 用法: node scripts/validate.js
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'xian', 'all.md');

try {
  const content = fs.readFileSync(DATA_FILE, 'utf-8');
  const lines = content.split('\n');
  
  let errors = 0;
  let records = 0;
  
  lines.forEach((line, i) => {
    const trimmed = line.trim();
    
    // Skip empty lines, headers, and section titles
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('---') || trimmed.startsWith('*') || trimmed.startsWith('```')) {
      return;
    }
    
    // Check if it looks like a record (contains |)
    if (trimmed.includes('|')) {
      records++;
      const parts = trimmed.split('|').map(p => p.trim());
      
      if (parts.length < 6) {
        console.error(`⚠️  Line ${i + 1}: 字段不足 (${parts.length}/6): ${trimmed.substring(0, 60)}`);
        errors++;
      }
      
      // Check evidence column exists and is non-empty
      const evidence = parts[parts.length - 1];
      if (!evidence || evidence === '') {
        console.error(`⚠️  Line ${i + 1}: 缺少证据链接: ${trimmed.substring(0, 60)}`);
        errors++;
      }
    }
  });
  
  console.log(`\n检查完毕：${records} 条记录，${errors} 个问题`);
  process.exit(errors > 0 ? 1 : 0);
  
} catch (err) {
  console.error('无法读取数据文件:', err.message);
  process.exit(1);
}
