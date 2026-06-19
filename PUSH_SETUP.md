# Web Push（后台推送，应用关闭后仍可收到）

## 1. 生成 VAPID 密钥

```bash
npx web-push generate-vapid-keys
```

填入 Vercel 环境变量：`VAPID_PUBLIC_KEY`、`VAPID_PRIVATE_KEY`、`VAPID_SUBJECT`（如 `mailto:your@email.com`）。

## 2. 连接 Upstash Redis

Vercel → **Integrations** → **Upstash Redis** → 关联本项目。

## 3. 配置 CRON_SECRET

Vercel **Environment Variables** 添加 `CRON_SECRET`（随机字符串，Sensitive）。

## 4. 配置 cron-job.org（推荐 1 个每小时任务）

详见 **[scripts/cron-jobs-beijing.md](./scripts/cron-jobs-beijing.md)**。

推荐：**每小时整点 1 个任务**（Asia/Shanghai），比 7 个整点任务更稳定。

## 5. 部署

`git push` 后 Vercel 自动部署，或 **Deployments → Redeploy**。

验证：https://daily-yong-shen.vercel.app/api/push/vapid-public-key 应返回 `{"publicKey":"..."}`。

## 6. 手机端

- Android Chrome / iOS 16.4+：添加到主屏幕，允许通知。
- 开启每日用神时需联网完成 Web Push 订阅。

## 本地开发 API

```bash
npm i -g vercel
vercel dev
```
