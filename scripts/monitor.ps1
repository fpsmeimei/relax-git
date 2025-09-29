# Relax-Git 监控快速查看工具
# 用法: .\scripts\monitor.ps1 [选项]

param(
    [string]$Action = "status",
    [switch]$Watch = $false,
    [int]$Interval = 5
)

$baseUrl = "http://localhost:3001"
$token = $env:RELAX_GIT_TOKEN  # 可选：从环境变量读取token

function Show-Banner {
    Write-Host ""
    Write-Host "====================================" -ForegroundColor Cyan
    Write-Host "   Relax-Git 监控面板 " -ForegroundColor Yellow
    Write-Host "====================================" -ForegroundColor Cyan
    Write-Host ""
}

function Get-ApiData {
    param([string]$endpoint)
    
    try {
        $headers = @{}
        if ($token) {
            $headers["Authorization"] = "Bearer $token"
        }
        
        $response = Invoke-RestMethod -Uri "$baseUrl$endpoint" -Headers $headers -Method Get
        return $response
    }
    catch {
        Write-Host "⚠️  无法连接到 API: $_" -ForegroundColor Red
        return $null
    }
}

function Show-QueueStatus {
    Write-Host "📊 队列状态" -ForegroundColor Green
    Write-Host "------------------------"
    
    $metrics = Get-ApiData "/api/snapshots/metrics/queue"
    if ($metrics) {
        Write-Host "  待处理: $($metrics.waiting) 个任务" -ForegroundColor $(if($metrics.waiting -gt 10) {"Yellow"} else {"White"})
        Write-Host "  处理中: $($metrics.active) 个任务"
        Write-Host "  已完成: $($metrics.completed) 个任务" -ForegroundColor Green
        Write-Host "  失败数: $($metrics.failed) 个任务" -ForegroundColor $(if($metrics.failed -gt 0) {"Red"} else {"White"})
        
        if ($metrics.avgProcessingTime) {
            $avgTime = [math]::Round($metrics.avgProcessingTime / 1000, 2)
            Write-Host "  平均处理时间: ${avgTime} 秒"
        }
    }
    else {
        Write-Host "  无法获取队列数据" -ForegroundColor Red
    }
}

function Show-SnapshotStats {
    Write-Host ""
    Write-Host "💾 快照统计" -ForegroundColor Green
    Write-Host "------------------------"
    
    $stats = Get-ApiData "/api/snapshots/metrics/stats"
    if ($stats) {
        Write-Host "  总快照数: $($stats.total)"
        Write-Host "  就绪状态: $($stats.ready)" -ForegroundColor Green
        Write-Host "  处理中: $($stats.processing)" -ForegroundColor Yellow
        Write-Host "  失败: $($stats.failed)" -ForegroundColor $(if($stats.failed -gt 0) {"Red"} else {"White"})
        
        if ($stats.reuseRate) {
            $reusePercent = [math]::Round($stats.reuseRate * 100, 1)
            Write-Host "  复用率: ${reusePercent}%" -ForegroundColor $(if($reusePercent -gt 50) {"Green"} else {"Yellow"})
        }
        
        if ($stats.totalSize) {
            $sizeMB = [math]::Round($stats.totalSize / 1024 / 1024, 2)
            Write-Host "  总大小: ${sizeMB} MB"
        }
    }
    else {
        Write-Host "  无法获取快照统计" -ForegroundColor Red
    }
}

function Show-Performance {
    Write-Host ""
    Write-Host "⚡ 性能指标" -ForegroundColor Green
    Write-Host "------------------------"
    
    $perf = Get-ApiData "/api/performance/report"
    if ($perf -and $perf.report) {
        $report = $perf.report
        
        # 缓存性能
        if ($report.cache) {
            $hitRate = [math]::Round($report.cache.hitRate * 100, 1)
            Write-Host "  缓存命中率: ${hitRate}%" -ForegroundColor $(if($hitRate -gt 70) {"Green"} else {"Yellow"})
        }
        
        # 压缩率
        if ($report.optimization) {
            $compRate = [math]::Round($report.optimization.compressionRatio * 100, 1)
            Write-Host "  压缩率: ${compRate}%"
            Write-Host "  平均加载时间: $($report.optimization.averageLoadTime) ms" -ForegroundColor $(if($report.optimization.averageLoadTime -lt 500) {"Green"} else {"Yellow"})
        }
        
        # 存储
        if ($report.storage) {
            $totalGB = [math]::Round($report.storage.total / 1024 / 1024 / 1024, 2)
            $localGB = [math]::Round($report.storage.local / 1024 / 1024 / 1024, 2)
            Write-Host "  总存储: ${totalGB} GB (本地: ${localGB} GB)"
        }
        
        # 优化建议
        if ($report.recommendations -and $report.recommendations.Count -gt 0) {
            Write-Host ""
            Write-Host "💡 优化建议:" -ForegroundColor Yellow
            foreach ($rec in $report.recommendations) {
                Write-Host "  • $rec"
            }
        }
    }
    else {
        Write-Host "  无法获取性能数据" -ForegroundColor Red
    }
}

function Show-RecentErrors {
    Write-Host ""
    Write-Host "❌ 最近错误" -ForegroundColor Red
    Write-Host "------------------------"
    
    # 查看最近的错误日志
    $logFile = "logs/error.log"
    if (Test-Path $logFile) {
        $errors = Get-Content $logFile -Tail 5
        if ($errors) {
            foreach ($error in $errors) {
                Write-Host "  $error" -ForegroundColor DarkRed
            }
        }
        else {
            Write-Host "  没有错误 ✅" -ForegroundColor Green
        }
    }
    else {
        Write-Host "  日志文件不存在" -ForegroundColor Gray
    }
}

function Show-SystemHealth {
    Write-Host ""
    Write-Host "🏥 系统健康" -ForegroundColor Green
    Write-Host "------------------------"
    
    # 检查各个服务
    $services = @(
        @{Name="API Server"; Url="$baseUrl/health"; Expected="ok"},
        @{Name="Redis"; Check={Test-NetConnection -ComputerName localhost -Port 6379 -InformationLevel Quiet}},
        @{Name="PostgreSQL"; Check={Test-NetConnection -ComputerName localhost -Port 5432 -InformationLevel Quiet}}
    )
    
    foreach ($service in $services) {
        if ($service.Url) {
            try {
                $response = Invoke-RestMethod -Uri $service.Url -Method Get
                if ($response -match $service.Expected) {
                    Write-Host "  ✅ $($service.Name): 正常" -ForegroundColor Green
                }
                else {
                    Write-Host "  ⚠️  $($service.Name): 异常" -ForegroundColor Yellow
                }
            }
            catch {
                Write-Host "  ❌ $($service.Name): 离线" -ForegroundColor Red
            }
        }
        elseif ($service.Check) {
            $result = & $service.Check
            if ($result) {
                Write-Host "  ✅ $($service.Name): 正常" -ForegroundColor Green
            }
            else {
                Write-Host "  ❌ $($service.Name): 离线" -ForegroundColor Red
            }
        }
    }
}

function Show-AllStatus {
    Clear-Host
    Show-Banner
    Show-QueueStatus
    Show-SnapshotStats
    Show-Performance
    Show-RecentErrors
    Show-SystemHealth
    
    Write-Host ""
    Write-Host "====================================" -ForegroundColor Cyan
    Write-Host "更新时间: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
}

# 主逻辑
switch ($Action) {
    "status" {
        if ($Watch) {
            Write-Host "开始监控 (按 Ctrl+C 退出)..." -ForegroundColor Yellow
            while ($true) {
                Show-AllStatus
                Start-Sleep -Seconds $Interval
            }
        }
        else {
            Show-AllStatus
        }
    }
    "queue" {
        Show-Banner
        Show-QueueStatus
    }
    "snapshot" {
        Show-Banner
        Show-SnapshotStats
    }
    "perf" {
        Show-Banner
        Show-Performance
    }
    "errors" {
        Show-Banner
        Show-RecentErrors
    }
    "health" {
        Show-Banner
        Show-SystemHealth
    }
    default {
        Write-Host "使用方法:" -ForegroundColor Yellow
        Write-Host "  .\scripts\monitor.ps1 [选项]" -ForegroundColor White
        Write-Host ""
        Write-Host "选项:" -ForegroundColor Yellow
        Write-Host "  status   - 显示所有状态 (默认)" -ForegroundColor White
        Write-Host "  queue    - 只显示队列状态" -ForegroundColor White
        Write-Host "  snapshot - 只显示快照统计" -ForegroundColor White
        Write-Host "  perf     - 只显示性能指标" -ForegroundColor White
        Write-Host "  errors   - 只显示错误日志" -ForegroundColor White
        Write-Host "  health   - 只显示系统健康" -ForegroundColor White
        Write-Host ""
        Write-Host "参数:" -ForegroundColor Yellow
        Write-Host "  -Watch      - 持续监控模式" -ForegroundColor White
        Write-Host "  -Interval N - 刷新间隔(秒), 默认5" -ForegroundColor White
        Write-Host ""
        Write-Host "示例:" -ForegroundColor Yellow
        Write-Host "  .\scripts\monitor.ps1              # 显示一次所有状态" -ForegroundColor Gray
        Write-Host "  .\scripts\monitor.ps1 -Watch       # 持续监控" -ForegroundColor Gray
        Write-Host "  .\scripts\monitor.ps1 queue        # 只看队列" -ForegroundColor Gray
        Write-Host "  .\scripts\monitor.ps1 -Watch -Interval 10  # 10秒刷新" -ForegroundColor Gray
    }
}