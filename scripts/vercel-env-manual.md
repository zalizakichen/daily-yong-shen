# Vercel 控制台手动配置

项目站点：https://daily-yong-shen.vercel.app

## 第一步：添加环境变量

进入 Vercel 项目 **Settings → Environment Variables**，从本地 `.env.local` 复制以下三项（勾选 Production、Preview、Development）：

| Name | 来源 |
|------|------|
| `VAPID_PUBLIC_KEY` | `.env.local` |
| `VAPID_PRIVATE_KEY` | `.env.local`（勾选 **Sensitive**） |
| `VAPID_SUBJECT` | `.env.local` |

`CRON_SECRET` 无需手动添加。

## 第二步：连接 Upstash Redis

1. 打开 https://vercel.com/marketplace/upstash
2. **Add Integration** → 选择本项目
3. 创建 Redis（Free 即可）
4. 关联后自动注入 `UPSTASH_REDIS_REST_URL` 与 `UPSTASH_REDIS_REST_TOKEN`

## 第三步：重新部署

Deployments → 最新部署 → **Redeploy**

## 第四步：验证

访问 https://daily-yong-shen.vercel.app/api/push/vapid-public-key

应返回 `{"publicKey":"..."}`。若 503，说明变量未生效，请 Redeploy。

## 第五步：手机端

1. 删除旧主屏幕图标，重新「添加到主屏幕」
2. 开启每日用神并允许通知
3. 设置推送时间后完全关闭 App 等待推送（Cron 每 5 分钟检查，最多延迟约 5 分钟）
