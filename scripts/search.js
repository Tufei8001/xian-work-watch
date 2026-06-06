#!/usr/bin/env node
/**
 * xian-work-watch — 西安求职避坑搜索
 * 
 * 用法: node scripts/search.js <公司名关键词>
 *       node scripts/search.js --list    # 列出所有记录
 *       node scripts/search.js --stats   # 统计信息
 * 
 * 支持模糊匹配: node scripts/search.js 西安XX
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'xian', 'all.md');

function parseRecords(content) {
  const records = [];
  const lines = content.split('\n');
  let currentCategory = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Detect category headers (## 欠薪, ## 虚假招聘, etc)
    const catMatch = line.match(/^##\s+(.+)/);
    if (catMatch && !line.includes('不良类型')) {
      currentCategory = catMatch[1];
      continue;
    }
    
    // Parse record lines: 公司名 | 区 | 标签 | 时间 | 描述 | 证据
    if (line.includes('|') && !line.startsWith('#')) {
      const parts = line.split('|').map(p => p.trim());
      
      // Skip format description lines
      if (parts[0].includes('公司名') || parts[0].includes('暂')) continue;
      
      if (parts.length >= 6) {
        records.push({
          company: parts[0],
          district: parts[1],
          tags: parts[2],
          time: parts[3],
          description: parts[4],
          evidence: parts[5],
          category: currentCategory,
        });
      }
    }
  }
  
  return records;
}

function search(records, query) {
  const q = query.toLowerCase();
  return records.filter(r => 
    r.company.toLowerCase().includes(q) ||
    r.district.toLowerCase().includes(q) ||
    r.description.toLowerCase().includes(q) ||
    r.tags.toLowerCase().includes(q)
  );
}

function formatResults(results, query) {
  if (results.length === 0) {
    return `🔍 未找到与「${query}」匹配的记录。\n\n暂无数据，欢迎通过 PR 提交。`;
  }
  
  let output = `🔍 找到 ${results.length} 条匹配记录（关键词: ${query}）\n${'─'.repeat(40)}\n\n`;
  
  results.forEach((r, i) => {
    output += `**${i + 1}. ${r.company}**\n`;
    output += `   🏷  ${r.category} | ${r.tags}\n`;
    output += `   📍  ${r.district}\n`;
    output += `   📅  ${r.time}\n`;
    output += `   📝  ${r.description}\n`;
    output += `   🔗  证据: ${r.evidence}\n\n`;
  });
  
  return output;
}

function formatStats(records) {
  if (records.length === 0) {
    return '📊 暂无记录';
  }
  
  const byCategory = {};
  records.forEach(r => {
    byCategory[r.category] = (byCategory[r.category] || 0) + 1;
  });
  
  const byDistrict = {};
  records.forEach(r => {
    byDistrict[r.district] = (byDistrict[r.district] || 0) + 1;
  });
  
  let output = `📊 数据统计\n${'─'.repeat(30)}\n\n`;
  output += `总记录数: ${records.length}\n\n`;
  
  output += `按类型:\n`;
  Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .forEach(([k, v]) => { output += `  ${k}: ${v} 条\n`; });
  
  output += `\n按区域:\n`;
  Object.entries(byDistrict)
    .sort((a, b) => b[1] - a[1])
    .forEach(([k, v]) => { output += `  ${k}: ${v} 条\n`; });
  
  return output;
}

function main() {
  const args = process.argv.slice(2);
  
  if (!fs.existsSync(DATA_FILE)) {
    console.log('⚠️  数据文件不存在，请先初始化项目。');
    process.exit(1);
  }
  
  const content = fs.readFileSync(DATA_FILE, 'utf-8');
  const records = parseRecords(content);
  
  if (args.length === 0 || args[0] === '--help') {
    console.log(`西安求职避坑 · 搜索工具

用法:
  node scripts/search.js <公司名关键词>    模糊搜索公司
  node scripts/search.js --list             列出所有记录
  node scripts/search.js --stats            统计信息
  node scripts/search.js --help             帮助

示例:
  node scripts/search.js 西安XX科技
  node scripts/search.js 高新区`);
    return;
  }
  
  if (args[0] === '--stats') {
    console.log(formatStats(records));
    return;
  }
  
  if (args[0] === '--list') {
    console.log(formatResults(records, '所有'));
    return;
  }
  
  const query = args.join(' ');
  const results = search(records, query);
  console.log(formatResults(results, query));
}

if (require.main === module) {
  main();
}

module.exports = { parseRecords, search, formatResults, formatStats };
