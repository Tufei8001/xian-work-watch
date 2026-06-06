---
name: xian-work-watch
description: 西安求职避坑指南。输入公司名称即可查询该企业在西安是否存在欠薪、虚假招聘、社保缺失、违法裁员等不良用工记录。当用户询问西安某公司是否靠谱、有无劳动纠纷黑历史、或求职避坑查询时使用。
---

# xian-work-watch

## 搜索公司不良记录

`scripts/search.js` — CLI 搜索工具:

```
node scripts/search.js <公司名>
node scripts/search.js <关键词>        # 模糊匹配
node scripts/search.js --stats          # 统计信息
node scripts/search.js --list           # 列出全部
```

例: `node scripts/search.js 西安XX科技`

## MCP Server

`mcp-server.js` — 适配 Claude Desktop / Cursor / Windsurf:

```
node mcp-server.js
```

Claude Desktop 配置:

```json
{
  "mcpServers": {
    "xian-work-watch": {
      "command": "node",
      "args": ["/path/to/xian-work-watch/mcp-server.js"]
    }
  }
}
```

提供三个工具: `search_company`, `list_all_records`, `get_statistics`

## 数据分类

| 分类 | 标签 | 说明 |
|------|------|------|
| 欠薪 | `欠薪` | 拖欠/克扣工资、拒付加班费 |
| 虚假招聘 | `虚招` | 挂A岗招B岗、KPI面、刷数据面 |
| 社保缺失 | `社保` | 试用期不交/不按实际基数交 |
| 违法裁员 | `裁员` | 违法解除、威胁自离、不给 N+1 |
| 竞业滥用 | `竞业` | 全员签竞业、赔钱还追 |
| 其他 | `其他` | 职场霸凌/性骚扰/不签合同等 |

## 记录格式

每条记录一行: `公司名 | 区 | 标签 | 时间 | 描述 | 证据链接`

## 维护

数据在 `data/xian/all.md` 中，按分类分组。提交新记录通过 GitHub PR，每一条必须有可验证的证据。
