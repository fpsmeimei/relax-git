# Quick Verify Script for Snapshot Flow
# PowerShell版本的快速验证脚本

Write-Host "🔍 开始验证快照流程..." -ForegroundColor Green
Write-Host ""

# 1. 检查服务状态
Write-Host "1️⃣ 检查服务状态..." -ForegroundColor Yellow
Write-Host "   检查API服务..."
$apiCheck = Test-NetConnection -ComputerName localhost -Port 3001 -InformationLevel Quiet
if ($apiCheck) {
    Write-Host "   ✅ API服务运行中 (端口 3001)" -ForegroundColor Green
} else {
    Write-Host "   ❌ API服务未运行" -ForegroundColor Red
}

Write-Host "   检查Redis..."
$redisCheck = Test-NetConnection -ComputerName localhost -Port 6379 -InformationLevel Quiet
if ($redisCheck) {
    Write-Host "   ✅ Redis运行中 (端口 6379)" -ForegroundColor Green
} else {
    Write-Host "   ❌ Redis未运行" -ForegroundColor Red
}

Write-Host "   检查PostgreSQL..."
$pgCheck = Test-NetConnection -ComputerName localhost -Port 5432 -InformationLevel Quiet
if ($pgCheck) {
    Write-Host "   ✅ PostgreSQL运行中 (端口 5432)" -ForegroundColor Green
} else {
    Write-Host "   ❌ PostgreSQL未运行" -ForegroundColor Red
}

Write-Host ""

# 2. 检查Worker配置
Write-Host "2️⃣ 检查Worker配置..." -ForegroundColor Yellow
$configPath = "F:\relax-git\apps\worker\config.yaml"
if (Test-Path $configPath) {
    $config = Get-Content $configPath -Raw
    if ($config -match "queue_name:\s*'snapshot:queue'") {
        Write-Host "   [OK] Worker queue config correct: snapshot:queue" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Worker队列配置错误" -ForegroundColor Red
    }
} else {
    Write-Host "   ❌ Worker配置文件不存在" -ForegroundColor Red
}

Write-Host ""

# 3. 提供下一步建议
Write-Host "3️⃣ 下一步操作建议:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Phase 0 任务状态:" -ForegroundColor Cyan
Write-Host "   ✅ 0.1 队列名称统一 - 已完成"
Write-Host "   🔄 0.2 Worker数据库写入验证 - 待验证"
Write-Host "   🔄 0.3 前端兼容处理 - 待执行"
Write-Host ""
Write-Host "   立即执行:" -ForegroundColor Cyan
Write-Host "   1. 启动Worker: cd apps/worker && go run main.go"
Write-Host "   2. 导入测试仓库验证流程"
Write-Host "   3. 检查base_snapshots表是否正确更新"
Write-Host ""
Write-Host "✅ 快速验证完成!" -ForegroundColor Green