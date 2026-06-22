# Vercel 环境变量

在 Vercel → Project → Settings → Environment Variables 添加：

| 变量 | 说明 |
|------|------|
| `VAPID_PUBLIC_KEY` | web-push 公钥 |
| `VAPID_PRIVATE_KEY` | web-push 私钥（Sensitive） |
| `VAPID_SUBJECT` | 如 `mailto:your@email.com` |
| `CRON_SECRET` | 可选，用于 curl 手动测试 cron（Sensitive） |

Upstash Redis 通过 Vercel Integrations 关联后，会自动注入 `KV_REST_API_*` 或 `UPSTASH_REDIS_*`。

## 定时推送

使用 **Vercel Cron**（见 `vercel.json`），每天 UTC 00:00 = 北京时间 08:00。  
**不需要** cron-job.org。

手动测试：

```bash
curl -H "Authorization: Bearer 你的CRON_SECRET" https://daily-yong-shen.vercel.app/api/cron/send-pushes
```

成功响应示例：`{"checked":1,"sent":1,"skipped":0,"failed":0,...}`
