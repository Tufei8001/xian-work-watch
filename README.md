# 西安求职避坑指南 · xian-work-watch

收集西安本地打工人分享的不良招聘/用工信息，互帮互助。

**本项目不制造焦虑，不放地图炮。只做三件事：**
1. 记录已发生的事实
2. 附上可验证的证据
3. 引用对应的法律条款

---

## 🚀 安装为 Agent 技能

### OpenClaw / Codex
```bash
npx skills add Tufei8001/xian-work-watch
```
安装后，输入公司名称即可查询不良记录。

### Claude Desktop
在 `claude_desktop_config.json` 中添加:
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
然后问 Claude: "查一下西安XX科技有没有劳动纠纷"

### Cursor / Windsurf
在 Cursor Settings → MCP 中添加:
- **名称**: xian-work-watch
- **类型**: command
- **命令**: `node /path/to/xian-work-watch/mcp-server.js`

### 直接 CLI 使用
```bash
node scripts/search.js 公司名
node scripts/search.js --stats
node scripts/search.js --list
```

---

---

## 不良类型

| 分类 | 标签 | 说明 |
|------|------|------|
| 欠薪 | `欠薪` | 拖欠/克扣工资、拒付加班费 |
| 虚假招聘 | `虚招` | 挂A岗招B岗、KPI面、刷数据面 |
| 社保缺失 | `社保` | 试用期不交/不按实际基数交 |
| 违法裁员 | `裁员` | 违法解除、威胁自离、不给 N+1 |
| 竞业滥用 | `竞业` | 全员签竞业、赔钱还追 |
| 其他 | `其他` | 职场霸凌/性骚扰/不签合同等 |

## 数据格式

每条记录一行：

```
[公司名] | [区] | [不良标签] | [曝光时间] | [描述] | [证据链接]
```

例：

```
西安XX科技有限公司 | 高新区 | 欠薪 | 2025-03 | 拖欠3个月工资，仲裁已立案 | [工资条] [仲裁受理书]
```

> 详细格式见 `data/xian/all.md`

## 如何提交

1. Fork 本仓库
2. 在 `data/xian/all.md` 末尾追加一条记录
3. 证据文件放入 `data/xian/img/`
4. 发起 Pull Request

**每一条记录必须有证据。** 无证据的 PR 会被直接关闭。

## 证据要求

| 证据类型 | 示例 | 可信度 |
|---------|------|--------|
| 劳动仲裁裁决书（公开） | 仲裁委官网截图 | ★★★★★ |
| 银行流水+工资单 | 实发 vs 应发对比 | ★★★★ |
| 聊天记录/邮件 | 公司承认欠薪/加班 | ★★★ |
| 招聘平台截图 | 挂羊头卖狗肉 | ★★★ |
| 天眼查经营异常记录 | 公开数据 | ★★★★ |

> 屏摄 > 截图（防数字盲水印追踪），详见 `CONTRIBUTING.md`

## 法律武器

- 《劳动合同法》第30条：及时足额支付劳动报酬
- 《劳动合同法》第85条：欠薪加付50%-100%赔偿金
- 西安市劳动仲裁院：029-12333

## 关联项目

- [996.ICU](https://github.com/996icu/996.ICU) — 996 工作制曝光
- [955.WLB](https://github.com/formulahendry/955.WLB) — 955 白名单
