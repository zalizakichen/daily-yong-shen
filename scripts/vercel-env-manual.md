# Vercel 控制台手动配置

项目站点：https://daily-yong-shen.vercel.app

## 第一步：添加环境变量

进入 Vercel 项目 **Settings → Environment Variables**（勾选 Production、Preview、Development）：

| Name | 说明 |
|------|------|
| `VAPID_PUBLIC_KEY` | VAPID 公钥 |
| `VAPID_PRIVATE_KEY` | VAPID 私钥（勾选 **Sensitive**） |
| `VAPID_SUBJECT` | 如 `mailto:zalizaki@163.com` |
| `CRON_SECRET` | 随机密码，供外部 Cron 调用（勾选 **Sensitive**） |

## 第二步：连接 Upstash Redis

1. 打开 https://vercel.com/marketplace/upstash
2. **Add Integration** → 选择本项目
3. 创建 Redis（Free 即可）

## 第三步：外部 Cron（Hobby 计划必须）

Vercel Hobby **不能**用内置每 5 分钟 Cron。在 https://cron-job.org 创建任务：

- URL: `https://daily-yong-shen.vercel.app/api/cron/send-pushes`
- 每 5 分钟执行一次
- Header: `Authorization: Bearer <CRON_SECRET>`

## 第四步：重新部署

Deployments → **Redeploy**

## 第五步：验证

1. https://daily-yong-shen.vercel.app/api/push/vapid-public-key → 应返回 `{"publicKey":"..."}`
2. 浏览器访问（需带 Header，或用 cron-job 测试）：推送接口应返回 JSON 而非 401

## 第六步：手机端

1. 删除旧主屏幕图标，重新「添加到主屏幕」
2. 开启每日用神并允许通知
3. 设置推送时间后完全关闭 App 等待（最多延迟约 5 分钟）
