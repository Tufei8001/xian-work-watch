#!/usr/bin/env node
/**
 * xian-work-watch MCP Server
 * 
 * 适配: Claude Desktop, Cursor, Windsurf, 及其他 MCP 客户端
 * 
 * 启动:
 *   node mcp-server.js
 * 
 * 或在 Claude Desktop 的 mcpServers 配置中添加:
 *   "xian-work-watch": {
 *     "command": "node",
 *     "args": ["/path/to/xian-work-watch/mcp-server.js"]
 *   }
 */

const fs = require('fs');
const path = require('path');
const { parseRecords, search, formatResults, formatStats } = require('./scripts/search');

const DATA_FILE = path.join(__dirname, 'data', 'xian', 'all.md');

// 简易 MCP over stdio
const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });

function sendResponse(id, result) {
  const msg = JSON.stringify({ jsonrpc: '2.0', id, result });
  process.stdout.write(msg + '\n');
}

function sendError(id, code, message) {
  const msg = JSON.stringify({ jsonrpc: '2.0', id, error: { code, message } });
  process.stdout.write(msg + '\n');
}

// 读取数据
function loadRecords() {
  if (!fs.existsSync(DATA_FILE)) return [];
  const content = fs.readFileSync(DATA_FILE, 'utf-8');
  return parseRecords(content);
}

// 处理请求
function handleRequest(req) {
  const { id, method, params } = req;
  
  if (method === 'initialize') {
    sendResponse(id, {
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: {
          listChanged: false,
        },
      },
      serverInfo: { name: 'xian-work-watch', version: '1.0.0' },
    });
    return;
  }
  
  if (method === 'notifications/initialized') {
    return; // no response
  }
  
  if (method === 'tools/list') {
    sendResponse(id, {
      tools: [
        {
          name: 'search_company',
          description: '搜索西安不良用工记录。输入公司名称关键词，返回匹配的投诉/曝光记录。可模糊搜索。',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: '公司名称关键词（支持模糊匹配）',
              },
            },
            required: ['query'],
          },
        },
        {
          name: 'list_all_records',
          description: '列出西安求职避坑数据库中的所有记录。',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_statistics',
          description: '获取西安求职避坑数据的统计信息（按类型/区域分布）。',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
      ],
    });
    return;
  }
  
  if (method === 'tools/call') {
    const { name, arguments: args } = params;
    
    const records = loadRecords();
    
    if (name === 'search_company') {
      const query = args?.query || '';
      if (!query.trim()) {
        sendError(id, -32000, '请提供公司名称关键词');
        return;
      }
      const results = search(records, query.trim());
      sendResponse(id, {
        content: [{ type: 'text', text: formatResults(results, query.trim()) }],
      });
      return;
    }
    
    if (name === 'list_all_records') {
      sendResponse(id, {
        content: [{ type: 'text', text: formatResults(records, '所有') }],
      });
      return;
    }
    
    if (name === 'get_statistics') {
      sendResponse(id, {
        content: [{ type: 'text', text: formatStats(records) }],
      });
      return;
    }
    
    sendError(id, -32601, `未知工具: ${name}`);
    return;
  }
  
  // 其他方法直接返回
  sendResponse(id, null);
}

rl.on('line', (line) => {
  try {
    const req = JSON.parse(line);
    handleRequest(req);
  } catch (err) {
    // ignore malformed
  }
});

// 收到初始化信号后，输出说明到 stderr
process.stderr.write('xian-work-watch MCP Server running on stdio\n');
