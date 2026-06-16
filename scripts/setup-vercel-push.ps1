# 每日用神 — Web Push 环境变量写入 Vercel
# 用法：
#   1. 确保 .env.local 中已有 VAPID_* 变量（见 .env.example）
#   2. npx vercel login && npx vercel link
#   3. .\scripts\setup-vercel-push.ps1

$ErrorActionPreference = "Stop"

function Read-EnvLocal($path) {
  $vars = @{}
  if (-not (Test-Path $path)) { return $vars }
  Get-Content $path | ForEach-Object {
    if ($_ -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$') {
      $vars[$matches[1]] = $matches[2]
    }
  }
  return $vars
}

$envVars = Read-EnvLocal ".env.local"
$publicKey = $envVars["VAPID_PUBLIC_KEY"]
$privateKey = $envVars["VAPID_PRIVATE_KEY"]
$subject = $envVars["VAPID_SUBJECT"]

if (-not $publicKey -or -not $privateKey -or -not $subject) {
  Write-Host "请先在 .env.local 中填写 VAPID_PUBLIC_KEY、VAPID_PRIVATE_KEY、VAPID_SUBJECT"
  exit 1
}

Write-Host "检查 Vercel 登录状态..."
npx vercel whoami
if ($LASTEXITCODE -ne 0) {
  Write-Host ""
  Write-Host "请先登录：npx vercel login"
  Write-Host "若 CLI 登录失败，请改用手动配置，见 scripts/vercel-env-manual.md"
  exit 1
}

if (-not (Test-Path ".vercel\project.json")) {
  Write-Host "关联项目：npx vercel link"
  npx vercel link
}

$targets = @("production", "preview", "development")

foreach ($target in $targets) {
  Write-Host "写入 VAPID_PUBLIC_KEY ($target)..."
  npx vercel env add VAPID_PUBLIC_KEY $target --value $publicKey --yes --force

  Write-Host "写入 VAPID_PRIVATE_KEY ($target)..."
  npx vercel env add VAPID_PRIVATE_KEY $target --value $privateKey --yes --force --sensitive

  Write-Host "写入 VAPID_SUBJECT ($target)..."
  npx vercel env add VAPID_SUBJECT $target --value $subject --yes --force
}

Write-Host ""
Write-Host "VAPID 环境变量已写入。接下来请连接 Upstash Redis，见 scripts/vercel-env-manual.md"
