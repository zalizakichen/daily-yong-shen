# 定时推送（已弃用 cron-job.org）

测试版已改为 **Vercel 内置 Cron**，无需在 cron-job.org 配置任何任务。

请删除 cron-job.org 上的旧任务，避免重复请求。

配置说明见 **[PUSH_SETUP.md](../PUSH_SETUP.md)**。

- 每天 **北京时间 08:00** 自动调用 `/api/cron/send-pushes`
- App 内只需选择 **星期**，时间固定为 08:00
