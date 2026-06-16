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

## 3. 配置定时触发（Hobby 计划必读）

**Vercel Hobby 免费版 Cron 每天只能运行 1 次**，无法使用 `vercel.json` 内置每 5 分钟 Cron。

请改用 **外部定时服务**（免费）每 5 分钟访问推送接口：

### 3.1 设置 CRON_SECRET

在 Vercel **Environment Variables** 手动添加：

| 变量 | 说明 |
|------|------|
| `CRON_SECRET` | 自行生成一串随机密码（如 32 位字母数字），勾选 Sensitive |

### 3.2 注册 cron-job.org（推荐）

1. 打开 https://cron-job.org 注册免费账号  
2. **Create cronjob**  
   - **URL**: `https://daily-yong-shen.vercel.app/api/cron/send-pushes`  
   - **Schedule**: 每 5 分钟（或 `*/5 * * * *`）  
   - **Request method**: GET  
   - **Headers**: `Authorization: Bearer 你的CRON_SECRET`  
3. 保存并启用  

成功时接口返回 JSON：`{"checked":0,"sent":0,...}`（无订阅用户时 sent 为 0 也正常）。

## 4. 部署

`git push` 后 Vercel 自动部署，或 **Deployments → Redeploy**。

## 5. 手机端要求

- **Android Chrome**：添加到主屏幕后，授予通知权限即可。
- **iOS 16.4+**：须「添加到主屏幕」打开（非 Safari 标签页），并允许通知。
- 首次开启每日用神时，需联网完成 Web Push 订阅同步。

## 本地开发 API

```bash
npm i -g vercel
vercel dev
```

仅 `npm run dev` 不会启动 `/api` 路由。
