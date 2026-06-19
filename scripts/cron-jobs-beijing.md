# cron-job.org：每日推送定时任务

## 推荐：1 个每小时任务（最简单、最稳定）

在 https://cron-job.org 创建 **1 个** Cron Job，删除旧的 7 个整点任务（若同时存在，容易并发打爆 Redis 导致 500）。

| 项 | 值 |
|----|-----|
| 任务名 | `daily-yong-shen-hourly` |
| URL | `https://daily-yong-shen.vercel.app/api/cron/send-pushes` |
| Method | GET |
| Header | `Authorization: Bearer 你的CRON_SECRET` |
| Timezone | **Asia/Shanghai**（北京时间） |
| 执行时间 | **Every hour**，At **:00**（每小时整点） |

每小时整点触发一次，服务端会检查各用户预约时刻（06/08/10/12/14/16/18）是否在 **15 分钟宽限**内，命中则推送。

**每天共 24 次请求**，比 7 个任务更可靠，且避免多任务同时 Run now 时并发失败。

---

## 备选：7 个整点任务

若仍想用 7 个任务，**不要**在同一分钟对多个任务点 Run now（会并发调用 Vercel + Redis）。

| 任务名（建议） | 北京时间 |
|----------------|----------|
| daily-yong-shen-0600 | 06:00 |
| daily-yong-shen-0800 | 08:00 |
| daily-yong-shen-1000 | 10:00 |
| daily-yong-shen-1200 | 12:00 |
| daily-yong-shen-1400 | 14:00 |
| daily-yong-shen-1600 | 16:00 |
| daily-yong-shen-1800 | 18:00 |

通用设置与上表相同（URL、Method、Header、Timezone）。

---

## 成功标志

手动 **Run now** 或到点后，HTTP 状态 **200**，响应类似：

```json
{"checked":1,"sent":0,"skipped":1,"failed":0}
```

- 无订阅用户时 `checked: 0` 也正常
- 有订阅但未到点：`skipped` ≥ 1，`sent: 0`
- 若 `failed` ≥ 1，看响应里的 `errors` 数组排查具体订阅

若 **503** 检查 Vercel 的 Redis / VAPID；若 **401** 检查 `CRON_SECRET` 与 Header 是否一致。

若 **500 FUNCTION_INVOCATION_FAILED**：
1. 确认 7 个任务没有同时 Run now
2. 改用上面 **1 个每小时任务**
3. 看 Vercel → Deployments → Functions → `api/cron/send-pushes` 日志

## 说明

- 推送按 **用户手机时区** 判断是否到点；cron 用北京时间触发，对中国大陆用户与北京时间一致。
- 整点后 **15 分钟内** 命中均有效（应对 cron 延迟）。
