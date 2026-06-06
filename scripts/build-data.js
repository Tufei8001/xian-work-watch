#!/usr/bin/env node
/**
 * build-data.js — 将 data/xian/all.md 转成前端可用的 JSON
 * 每次更新数据后运行: node scripts/build-data.js
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'xian', 'all.md');
const OUTPUT_FILE = path.join(__dirname, '..', 'docs', 'data.json');

function parseRecords(content) {
  const records = [];
  const lines = content.split('\n');
  let currentCategory = '';

  for (const line of lines) {
    const t = line.trim();

    const catMatch = t.match(/^##\s+(.+)/);
    if (catMatch && !t.includes('不良类型') && !t.includes('公司名')) {
      currentCategory = catMatch[1];
      continue;
    }

    if (t.includes('|') && !t.startsWith('#') && !t.startsWith('*') && !t.startsWith('```')) {
      const parts = t.split('|').map(p => p.trim());
      if (parts[0] && parts[0] !== '公司名' && !parts[0].includes('暂无') && parts[0].length > 1) {
        records.push({
          company: parts[0] || '',
          district: parts[1] || '',
          tags: parts[2] || '',
          time: parts[3] || '',
          description: parts[4] || '',
          evidence: parts[5] || '',
          category: currentCategory,
        });
      }
    }
  }

  return records;
}

if (!fs.existsSync(DATA_FILE)) {
  console.error('数据文件不存在');
  process.exit(1);
}

const content = fs.readFileSync(DATA_FILE, 'utf-8');
const records = parseRecords(content);

// Also generate a simplified version for fast searching
const searchIndex = records.map(r => ({
  c: r.company,
  d: r.district,
  t: r.tags,
  tm: r.time,
  desc: r.description.substring(0, 100),
  cat: r.category,
  evidence: r.evidence.substring(0, 120),
}));

fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ records, index: searchIndex, updated: new Date().toISOString() }, null, 2));
console.log(`✅ 生成 data.json: ${records.length} 条记录, ${OUTPUT_FILE}`);
