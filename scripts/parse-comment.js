#!/usr/bin/env node
/**
 * parse-comment.js — 从社交平台评论中提取公司不良记录
 * 
 * 用法: 
 *   解析单条评论: node scripts/parse-comment.js "📌 公司名:..."
 *   批量解析文件: node scripts/parse-comment.js --file comments.txt
 *   预览模板: node scripts/parse-comment.js --template
 */

const fs = require('fs');
const path = require('path');

// 问题类型映射
const TAG_MAP = {
  '欠薪': '欠薪',
  '拖欠工资': '欠薪',
  '不发工资': '欠薪',
  '克扣': '欠薪',
  '虚招': '虚招',
  '虚假招聘': '虚招',
  '骗人': '虚招',
  'KPI面': '虚招',
  '社保': '社保',
  '不交社保': '社保',
  '没社保': '社保',
  '五险': '社保',
  '裁员': '裁员',
  '违法裁员': '裁员',
  '辞退': '裁员',
  '优化': '裁员',
  '竞业': '竞业',
  '竞业限制': '竞业',
  '霸凌': '其他',
  '性骚扰': '其他',
  '不签合同': '其他',
  '996': '其他',
  '007': '其他',
  'PUA': '其他',
  '大小周': '其他',
  '加班': '其他',
};

// 西安区域关键词
const DISTRICT_KEYWORDS = [
  '高新区', '雁塔区', '碑林区', '莲湖区', '新城区', '未央区',
  '灞桥区', '长安区', '临潼区', '高陵区', '鄠邑区', '阎良区',
  '西咸新区', '曲江新区', '航天基地', '经开区', '浐灞',
  '蓝田', '周至',
];

function parseComment(text) {
  if (!text || text.trim().length < 10) return null;

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const result = { company: '', district: '', tags: [], time: '', description: '', evidence: '' };

  // Try structured format first
  for (const line of lines) {
    // 匹配各种可能的键名
    const patterns = [
      // 📌 公司名称：XXX
      /(?:公司名?|企业|单位|公司名称)\s*[:：]\s*(.+)/i,
      // 📍 区域：高新区
      /(?:区域?|在哪个区|地点|地区|位置)\s*[:：]\s*(.+)/i,
      // ⚠️ 问题类型：欠薪
      /(?:问题|类型|问题类型|什么坑|什么情况|分类)\s*[:：]\s*(.+)/i,
      // 📅 时间：2024年
      /(?:时间|什么时候|发生时间|年份|年月)\s*[:：]\s*(.+)/i,
      // 📝 描述：xxx
      /(?:描述|经过|详细|说明|说一下|具体情况)\s*[:：]\s*(.+)/i,
    ];

    for (let i = 0; i < patterns.length; i++) {
      const m = line.match(patterns[i]);
      if (!m) continue;
      const val = m[1].trim();
      switch (i) {
        case 0: result.company = val; break;
        case 1: result.district = val; break;
        case 2:
          // Map to known tags
          for (const [keyword, tag] of Object.entries(TAG_MAP)) {
            if (val.includes(keyword)) {
              if (!result.tags.includes(tag)) result.tags.push(tag);
            }
          }
          if (result.tags.length === 0) result.tags.push('其他');
          break;
        case 3: result.time = val; break;
        case 4: result.description = val; break;
      }
    }
  }

  // If structured parsing found nothing, try free-text extraction
  if (!result.company) {
    // Try to extract from free-form text
    result.description = text.substring(0, 500);
    
    // Try to find company name (first line, or before first punctuation)
    const firstLine = lines[0] || '';
    const companyMatch = firstLine.match(/^(.{2,30}?(?:公司|科技|集团|有限|工作室|店))/);
    if (companyMatch) result.company = companyMatch[1];
    
    // Try to find district
    for (const d of DISTRICT_KEYWORDS) {
      if (text.includes(d)) { result.district = d; break; }
    }
    
    // Try to find tags
    for (const [keyword, tag] of Object.entries(TAG_MAP)) {
      if (text.includes(keyword)) {
        if (!result.tags.includes(tag)) result.tags.push(tag);
      }
    }
    if (result.tags.length === 0) result.tags.push('其他');
    
    // Try to find time
    const timeMatch = text.match(/(20\d{2})[年.-]/);
    if (timeMatch) result.time = timeMatch[1];
  }

  return result;
}

function formatOutput(data) {
  if (!data || !data.company) return null;
  const tag = data.tags.length > 0 ? data.tags[0] : '其他';
  const district = data.district || '未知';
  const time = data.time || '未知';
  const desc = data.description || '待补充';
  return `${data.company} | ${district} | ${tag} | ${time} | ${desc} | 待审核`;
}

function showTemplate() {
  console.log(`═══════════════════════════════════════════
  西安求职避坑 · 评论提交模板
═══════════════════════════════════════════

直接在评论区按这个格式回复👇

📌 公司名称：XXX有限公司
📍 在哪个区：高新区/雁塔区/...
⚠️ 什么问题：欠薪/虚假招聘/社保缺失/裁员/竞业/其他
📅 发生时间：2024年X月
📝 详细描述：发生了什么，简单说一下

--- 可选补充 ---
🔗 证据链接：聊天截图/录音/合同（可私信）

═══════════════════════════════════════════

示例：
📌 公司名称：西安XX科技有限公司
📍 在哪个区：高新区
⚠️ 什么问题：欠薪
📅 发生时间：2024年3月
📝 详细描述：试用期2个月没发工资，离职后还拖着
`);
}

const TEMPLATE_SLIDE = `
📌 公司名称：_______________
📍 在哪个区：_______________
⚠️ 什么问题：_______________
📅 发生时间：_______________
📝 详细描述：_______________

《西安求职避坑指南》
https://github.com/Tufei8001/xian-work-watch

不限于IT行业，任何公司都可以。
每条信息请确保真实，必要时附上证据。
`;

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help') {
    console.log(`评论解析工具

用法:
  node scripts/parse-comment.js "<评论内容>"      解析单条评论
  node scripts/parse-comment.js --file <文件路径>  批量解析文件
  node scripts/parse-comment.js --template         显示模板
  node scripts/parse-comment.js --slide            生成发帖用模板卡片
`);
    return;
  }

  if (args[0] === '--template') {
    showTemplate();
    return;
  }

  if (args[0] === '--slide') {
    console.log(TEMPLATE_SLIDE.trim());
    return;
  }

  if (args[0] === '--file') {
    const filePath = args[1];
    if (!filePath || !fs.existsSync(filePath)) {
      console.error('文件不存在:', filePath);
      process.exit(1);
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    const comments = content.split(/---\s*\n/).filter(Boolean);
    
    let parsed = 0, failed = 0;
    for (const comment of comments) {
      const result = parseComment(comment.trim());
      const line = formatOutput(result);
      if (line) {
        console.log(line);
        parsed++;
      } else {
        failed++;
      }
    }
    console.error(`\n完成: 解析 ${parsed} 条, 失败 ${failed} 条`);
    return;
  }

  // Single comment
  const text = args.join(' ');
  const result = parseComment(text);
  if (result && result.company) {
    console.log('\n解析结果:');
    console.log(JSON.stringify(result, null, 2));
    console.log('\n待入库格式:');
    console.log(formatOutput(result));
  } else {
    console.log('未能从这条评论中提取有效信息。试试用结构化格式提交。');
    showTemplate();
  }
}

if (require.main === module) {
  main();
}

module.exports = { parseComment, formatOutput, showTemplate, TEMPLATE_SLIDE };
