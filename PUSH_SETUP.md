# Web Push（后台推送，应用关闭后仍可收到）

## 1. 生成 VAPID 密钥

在项目根目录执行：

```bash
npx web-push generate-vapid-keys
```

将输出的 Public Key / Private Key 填入 Vercel 环境变量：

| 变量 | 说明 |
|------|------|
| `VAPID_PUBLIC_KEY` | 公钥 |
| `VAPID_PRIVATE_KEY` | 私钥 |
| `VAPID_SUBJECT` | 例如 `mailto:your@email.com` |

## 2. 连接 Redis（Upstash）

1. 在 Vercel 项目 → **Integrations** → Marketplace → 搜索 **Upstash Redis**
2. 创建并关联到本项目（会自动注入 `UPSTASH_REDIS_REST_URL` 与 `UPSTASH_REDIS_REST_TOKEN`）

若你已有旧版 Vercel KV，也可继续使用 `KV_REST_API_URL` / `KV_REST_API_TOKEN`。

## 3. 部署

重新部署后，Cron 会每 5 分钟检查预约并发送推送。

`CRON_SECRET` 由 Vercel 在启用 Cron 时自动配置，无需手动添加。

## 4. 手机端要求

- **Android Chrome**：添加到主屏幕后，授予通知权限即可。
- **iOS 16.4+**：须「添加到主屏幕」打开（非 Safari 标签页），并允许通知。
- 首次开启每日用神时，需联网完成 Web Push 订阅同步。

## 本地开发 API

安装 Vercel CLI 后可在本地调试服务端接口：

```bash
npm i -g vercel
vercel dev
```

仅 `npm run dev` 不会启动 `/api` 路由。
