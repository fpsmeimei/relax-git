# Relax-Git MCP 配置安装脚本
# 适用于 Windows PowerShell

Write-Host "🚀 开始配置 Relax-Git MCP 服务器..." -ForegroundColor Green

# 检查 Node.js 安装
Write-Host "📋 检查 Node.js 安装..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    $npmVersion = npm --version
    Write-Host "✅ Node.js 版本: $nodeVersion" -ForegroundColor Green
    Write-Host "✅ npm 版本: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ 未找到 Node.js，请先安装 Node.js" -ForegroundColor Red
    exit 1
}

# 检查 uv 安装
Write-Host "📋 检查 uv 安装..." -ForegroundColor Yellow
try {
    $uvVersion = uv --version
    Write-Host "✅ uv 版本: $uvVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  未找到 uv，正在安装..." -ForegroundColor Yellow
    npm install -g uv
}

# 创建必要目录
Write-Host "📁 创建数据目录..." -ForegroundColor Yellow
$directories = @(
    "D:\workspace\tools\mcp-shrimp-task-manager\data",
    "D:\workspace\tools\server-memory"
)

foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force
        Write-Host "✅ 创建目录: $dir" -ForegroundColor Green
    } else {
        Write-Host "✅ 目录已存在: $dir" -ForegroundColor Green
    }
}

# 创建 Cursor 配置目录
$cursorConfigDir = "$env:USERPROFILE\.cursor"
if (!(Test-Path $cursorConfigDir)) {
    New-Item -ItemType Directory -Path $cursorConfigDir -Force
    Write-Host "✅ 创建 Cursor 配置目录: $cursorConfigDir" -ForegroundColor Green
}

# 复制 MCP 配置文件
$mcpConfigSource = "mcp-config.json"
$mcpConfigDest = "$cursorConfigDir\mcp-config.json"

if (Test-Path $mcpConfigSource) {
    Copy-Item $mcpConfigSource $mcpConfigDest -Force
    Write-Host "✅ MCP 配置文件已复制到: $mcpConfigDest" -ForegroundColor Green
} else {
    Write-Host "❌ 未找到 mcp-config.json 文件" -ForegroundColor Red
    exit 1
}

# 测试 MCP 服务器
Write-Host "🧪 测试 MCP 服务器..." -ForegroundColor Yellow

$testServers = @(
    @{name="context7"; command="npx -y @upstash/context7-mcp@latest --help"},
    @{name="sequential-thinking"; command="npx -y @modelcontextprotocol/server-sequential-thinking --help"},
    @{name="playwright"; command="npx @playwright/mcp@latest --help"}
)

foreach ($server in $testServers) {
    Write-Host "测试 $($server.name)..." -ForegroundColor Cyan
    try {
        Invoke-Expression $server.command | Out-Null
        Write-Host "✅ $($server.name) 测试通过" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  $($server.name) 测试失败，可能需要网络连接" -ForegroundColor Yellow
    }
}

# 创建项目级配置
$projectConfigDir = ".cursor"
if (!(Test-Path $projectConfigDir)) {
    New-Item -ItemType Directory -Path $projectConfigDir -Force
    Write-Host "✅ 创建项目级配置目录: $projectConfigDir" -ForegroundColor Green
}

Copy-Item $mcpConfigSource "$projectConfigDir\mcp-config.json" -Force
Write-Host "✅ 项目级 MCP 配置已创建" -ForegroundColor Green

# 显示配置摘要
Write-Host "`n📊 MCP 配置摘要:" -ForegroundColor Cyan
Write-Host "├── 全局配置: $mcpConfigDest" -ForegroundColor White
Write-Host "├── 项目配置: $projectConfigDir\mcp-config.json" -ForegroundColor White
Write-Host "├── 任务管理数据: D:\workspace\tools\mcp-shrimp-task-manager\data" -ForegroundColor White
Write-Host "└── 记忆服务数据: D:\workspace\tools\server-memory\memory.json" -ForegroundColor White

Write-Host "`n🎉 MCP 配置完成！" -ForegroundColor Green
Write-Host "💡 重启 Cursor 编辑器以加载新的 MCP 配置" -ForegroundColor Yellow
Write-Host "📚 详细说明请查看 MCP-SETUP.md" -ForegroundColor Blue



