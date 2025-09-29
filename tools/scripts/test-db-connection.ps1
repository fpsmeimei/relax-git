# 测试数据库连接和表结构
Write-Host "🔍 测试数据库连接和表结构..." -ForegroundColor Green

# 检查PostgreSQL连接
Write-Host "`n1️⃣ 检查PostgreSQL服务..." -ForegroundColor Yellow
$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
if ($pgService -and $pgService.Status -eq "Running") {
    Write-Host "   ✅ PostgreSQL服务运行中" -ForegroundColor Green
} else {
    Write-Host "   ❌ PostgreSQL服务未运行" -ForegroundColor Red
}

# 检查端口
Write-Host "`n2️⃣ 检查数据库端口..." -ForegroundColor Yellow
$pgCheck = Test-NetConnection -ComputerName localhost -Port 5432 -InformationLevel Quiet
if ($pgCheck) {
    Write-Host "   ✅ 数据库端口 5432 可访问" -ForegroundColor Green
} else {
    Write-Host "   ❌ 数据库端口 5432 不可访问" -ForegroundColor Red
}

# 检查Redis
Write-Host "`n3️⃣ 检查Redis服务..." -ForegroundColor Yellow
$redisCheck = Test-NetConnection -ComputerName localhost -Port 6379 -InformationLevel Quiet
if ($redisCheck) {
    Write-Host "   ✅ Redis端口 6379 可访问" -ForegroundColor Green
} else {
    Write-Host "   ❌ Redis端口 6379 不可访问" -ForegroundColor Red
}

Write-Host "`n4️⃣ 建议操作:" -ForegroundColor Yellow
Write-Host "   如果服务正常，可以启动Worker:"
Write-Host "   cd F:\relax-git\apps\worker"
Write-Host "   .\worker.exe"
Write-Host ""
Write-Host "   同时在另一个终端启动API:"
Write-Host "   cd F:\relax-git"
Write-Host "   pnpm dev"
Write-Host ""
Write-Host "✅ 检查完成!" -ForegroundColor Green