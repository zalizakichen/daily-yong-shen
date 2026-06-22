# Web Push（后台推送，应用关闭后仍可收到）

## 1. 生成 VAPID 密钥

```bash
npx web-push generate-vapid-keys
```

填入 Vercel 环境变量：`VAPID_PUBLIC_KEY`、`VAPID_PRIVATE_KEY`、`VAPID_SUBJECT`（如 `mailto:your@email.com`）。

## 2. 连接 Upstash Redis

Vercel → **Integrations** → **Upstash Redis** → 关联本项目。

## 3. 配置 CRON_SECRET（可选，用于手动测试）

Vercel **Environment Variables** 添加 `CRON_SECRET`（随机字符串，Sensitive）。

手动测试：

```bash
curl -H "Authorization: Bearer 你的CRON_SECRET" https://daily-yong-shen.vercel.app/api/cron/send-pushes
```

## 4. 定时推送（Vercel Cron，无需 cron-job.org）

已在 `vercel.json` 配置：

- **路径**：`/api/cron/send-pushes`
- **时间**：`0 0 * * *`（UTC 00:00 = **北京时间 08:00**）
- **规则**：测试版固定每天 **08:00 北京时间**；用户只需在 App 里选择星期

部署后 Vercel 会自动带 `x-vercel-cron` 请求头触发；若设置了 `CRON_SECRET`，Vercel Cron 也会自动附带 `Authorization`。

## 5. 部署

`git push` 后 Vercel 自动部署。  
验证：https://daily-yong-shen.vercel.app/api/push/vapid-public-key 应返回 `{"publicKey":"..."}`。

## 6. 手机端

- Android Chrome / iOS 16.4+：添加到主屏幕，允许通知。
- 开启每日用神时需联网完成 Web Push 订阅。
- 改星期后打开 App 几秒，让订阅同步到服务端。

## 本地开发 API

```bash
npm i -g vercel
vercel dev
```
