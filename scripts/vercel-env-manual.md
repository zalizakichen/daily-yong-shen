# Vercel 控制台手动配置

项目站点：https://daily-yong-shen.vercel.app

## 环境变量

| Name | 说明 |
|------|------|
| `VAPID_PUBLIC_KEY` | VAPID 公钥 |
| `VAPID_PRIVATE_KEY` | 私钥（Sensitive） |
| `VAPID_SUBJECT` | 如 `mailto:zalizaki@163.com` |
| `CRON_SECRET` | 与 cron-job Header 一致（Sensitive） |

Upstash Redis 集成后自动有 `UPSTASH_REDIS_REST_URL`、`UPSTASH_REDIS_REST_TOKEN`。

## cron-job.org（7 个整点）

详见 [cron-jobs-beijing.md](./cron-jobs-beijing.md)。

## Redeploy → 验证 → 手机测试

1. `/api/push/vapid-public-key` → JSON  
2. cron **Run now** → 200  
3. 手机重新加主屏幕、开通知、设推送时间
