# Worker测试启动脚本
Write-Host "🚀 启动Relax-Git Worker..." -ForegroundColor Green
Write-Host "配置信息:"
Write-Host "- 队列名称: snapshot:queue"
Write-Host "- 工作目录: C:\temp\relax-git-worker"
Write-Host "- 并发数: 3"
Write-Host ""
Write-Host "按 Ctrl+C 停止Worker"
Write-Host "----------------------------------------"

# 启动Worker
.\worker.exe