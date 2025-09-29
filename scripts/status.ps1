# 超简单状态查看 - 一行命令看关键信息
# 用法: .\scripts\status.ps1

Write-Host ""
Write-Host "🚀 Relax-Git 快速状态" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor DarkGray

# 1. 检查服务是否运行
$apiRunning = $false
$workerRunning = $false
$redisRunning = $false
$dbRunning = $false

try {
    $null = Invoke-RestMethod -Uri "http://localhost:3001/health" -TimeoutSec 1
    $apiRunning = $true
} catch {}

try {
    $null = Test-NetConnection -ComputerName localhost -Port 6379 -InformationLevel Quiet -WarningAction SilentlyContinue
    $redisRunning = $true
} catch {}

try {
    $null = Test-NetConnection -ComputerName localhost -Port 5432 -InformationLevel Quiet -WarningAction SilentlyContinue
    $dbRunning = $true
} catch {}

# 检查worker进程
$workerProcess = Get-Process -Name "relax-git-worker" -ErrorAction SilentlyContinue
if ($workerProcess) {
    $workerRunning = $true
}

# 2. 显示服务状态
Write-Host ""
Write-Host "服务状态:" -ForegroundColor Yellow
Write-Host "  API:      $(if($apiRunning) {'✅ 运行中'} else {'❌ 已停止'})" -ForegroundColor $(if($apiRunning) {'Green'} else {'Red'})
Write-Host "  Worker:   $(if($workerRunning) {'✅ 运行中'} else {'⚠️  可能未启动'})" -ForegroundColor $(if($workerRunning) {'Green'} else {'Yellow'})
Write-Host "  Redis:    $(if($redisRunning) {'✅ 运行中'} else {'❌ 已停止'})" -ForegroundColor $(if($redisRunning) {'Green'} else {'Red'})
Write-Host "  数据库:   $(if($dbRunning) {'✅ 运行中'} else {'❌ 已停止'})" -ForegroundColor $(if($dbRunning) {'Green'} else {'Red'})

# 3. 如果API运行，获取快照统计
if ($apiRunning) {
    Write-Host ""
    Write-Host "快照统计:" -ForegroundColor Yellow
    
    try {
        $stats = Invoke-RestMethod -Uri "http://localhost:3001/api/snapshots/metrics/stats" -TimeoutSec 2
        Write-Host "  总数: $($stats.total) 个"
        Write-Host "  就绪: $($stats.ready) 个" -ForegroundColor Green
        
        if ($stats.processing -gt 0) {
            Write-Host "  处理中: $($stats.processing) 个" -ForegroundColor Yellow
        }
        
        if ($stats.failed -gt 0) {
            Write-Host "  失败: $($stats.failed) 个" -ForegroundColor Red
        }
        
        if ($stats.reuseRate) {
            $reusePercent = [math]::Round($stats.reuseRate * 100, 1)
            Write-Host "  复用率: ${reusePercent}%" -ForegroundColor $(if($reusePercent -gt 30) {'Green'} else {'Yellow'})
        }
    }
    catch {
        Write-Host "  无法获取统计信息" -ForegroundColor Gray
    }
    
    # 4. 获取队列状态
    Write-Host ""
    Write-Host "队列状态:" -ForegroundColor Yellow
    
    try {
        $queue = Invoke-RestMethod -Uri "http://localhost:3001/api/snapshots/metrics/queue" -TimeoutSec 2
        
        if ($queue.waiting -gt 0) {
            Write-Host "  待处理: $($queue.waiting) 个" -ForegroundColor Yellow
        }
        else {
            Write-Host "  队列空闲 ✅" -ForegroundColor Green
        }
        
        if ($queue.active -gt 0) {
            Write-Host "  处理中: $($queue.active) 个"
        }
        
        if ($queue.failed -gt 0) {
            Write-Host "  失败: $($queue.failed) 个" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "  无法获取队列信息" -ForegroundColor Gray
    }
}

# 5. 显示最新的错误（如果有）
$logFile = "logs/error.log"
if (Test-Path $logFile) {
    $lastError = Get-Content $logFile -Tail 1
    if ($lastError) {
        Write-Host ""
        Write-Host "最近错误:" -ForegroundColor Red
        Write-Host "  $lastError" -ForegroundColor DarkRed
    }
}

Write-Host ""
Write-Host "=====================" -ForegroundColor DarkGray
Write-Host "💡 提示: 使用 .\scripts\monitor.ps1 查看详细监控" -ForegroundColor Gray
Write-Host ""