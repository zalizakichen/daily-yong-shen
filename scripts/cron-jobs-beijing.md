# cron-job.org：北京时间 7 个整点推送

在 https://cron-job.org 创建 **7 个** Cron Job（删除旧的「每 5 分钟」任务）。

## 通用设置（每个任务相同）

| 项 | 值 |
|----|-----|
| URL | `https://daily-yong-shen.vercel.app/api/cron/send-pushes` |
| Method | GET |
| Header | `Authorization: Bearer 你的CRON_SECRET` |
| Timezone | **Asia/Shanghai**（北京时间） |

## 7 个任务的执行时间

每个任务选 **Every day**，**At** 对应整点：

| 任务名（建议） | 北京时间 | 会推送给选了该时间的用户 |
|----------------|----------|------------------------|
| daily-yong-shen-0600 | 06:00 | 06:00 |
| daily-yong-shen-0800 | 08:00 | 08:00 |
| daily-yong-shen-1000 | 10:00 | 10:00 |
| daily-yong-shen-1200 | 12:00 | 12:00 |
| daily-yong-shen-1400 | 14:00 | 14:00 |
| daily-yong-shen-1600 | 16:00 | 16:00 |
| daily-yong-shen-1800 | 18:00 | 18:00 |

**每天共 7 次请求**（不是每 5 分钟 288 次）。

## 成功标志

手动 **Run now** 或到点后，HTTP 状态 **200**，响应类似：

```json
{"checked":0,"sent":0,"skipped":0,"failed":0}
```

无订阅用户时 `sent: 0` 也正常。若 **503** 检查 Vercel 的 Redis / VAPID；若 **401** 检查 `CRON_SECRET` 与 Header 是否一致。

## 说明

- 推送按 **用户手机时区** 判断是否到点；cron 用北京时间触发，对中国大陆用户与北京时间一致。
- 整点后 **15 分钟内** 命中均有效（应对 cron 延迟）。
