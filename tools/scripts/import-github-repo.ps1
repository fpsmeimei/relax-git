#requires -Version 5.1
<#!
  导入 GitHub 仓库到 Relax-Git 的一键脚本（Windows PowerShell）
  - 创建或复用仓库记录
  - 为指定分支创建快照（自动解析远程 HEAD/Commit SHA）


  先决条件：
  - Relax-Git API 已启动（默认 http://localhost:3001）
  - 已初始化数据库与依赖服务（按 README 的“方案B（默认）：分步启动”完成：pnpm docker:dev 启动依赖，pnpm db:setup 初始化数据库；确保 API 正在 http://localhost:3001 运行）
  - 凭证：使用种子用户 admin/admin123 登录

  用法示例：
    pwsh -File tools/scripts/import-github-repo.ps1 -GitUrl https://github.com/fpsmeimei/simpleblog-for-realx-git.git -Name simpleblog -BaseBranch main -FeatureBranch feature/comment-system
!#>

param(
  [Parameter(Mandatory = $true)]
  [string]$GitUrl,
  [string]$Name = "simpleblog",
  [string]$BaseBranch = "main",
  [string]$FeatureBranch = "feature/comment-system",
  [string]$ApiBase = "http://localhost:3001"

)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Write-Info($msg)  { Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Ok($msg)    { Write-Host "[ OK ] $msg" -ForegroundColor Green }
function Write-Warn($msg)  { Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Write-Err($msg)   { Write-Host "[ERR ] $msg" -ForegroundColor Red }

function Require-Command([string]$cmd,[string]$hint){
  if(-not (Get-Command $cmd -ErrorAction SilentlyContinue)){
    throw "未找到命令 '$cmd'，请先安装。提示：$hint"
  }
}

function Invoke-JsonPost([string]$Url, $Body, [hashtable]$Headers) {
  $json = $Body | ConvertTo-Json -Depth 10
  return Invoke-RestMethod -Method Post -Uri $Url -Headers $Headers -ContentType 'application/json' -Body $json
}

function Get-CommitSha([string]$Remote, [string]$Branch){
  try {
    $out = git ls-remote --heads "$Remote" "$Branch" 2>$null
    if([string]::IsNullOrWhiteSpace($out)){ return $null }
    $parts = $out -split "`t"  # sha<TAB>refs/heads/branch
    if($parts.Length -ge 1){
      $sha = ($parts[0]).Trim()
      if($sha -match '^[0-9a-f]{40}$'){ return $sha }
    }
    return $null
  } catch {
    return $null
  }
}

function Main(){
  Require-Command git "https://git-scm.com/download/win"

  # 1) 登录获取 Token（admin/admin123）
  Write-Info "登录 Relax-Git API..."
  $login = Invoke-RestMethod -Method Post -Uri "$ApiBase/auth/login" -ContentType 'application/json' -Body '{"username":"admin","password":"admin123"}'
  $token = $login.accessToken
  if(-not $token){ throw '登录失败：未获取 accessToken' }
  $headers = @{ Authorization = "Bearer $token" }
  Write-Ok "登录成功"

  # 2) 创建/复用仓库
  Write-Info "创建仓库（或复用）: $Name -> $GitUrl"
  try {
    $repo = Invoke-JsonPost "$ApiBase/repositories" @{ name=$Name; gitUrl=$GitUrl; defaultBranch=$BaseBranch; visibility='PUBLIC' } $headers
  } catch {
    Write-Warn "创建仓库失败，尝试按名称查找：$Name"
    $list = Invoke-RestMethod -Method Get -Uri "$ApiBase/repositories?search=$Name&limit=20" -Headers $headers
    $repo = $list.repositories | Where-Object { $_.name -eq $Name } | Select-Object -First 1
    if(-not $repo){ throw "未找到或创建仓库：$Name" }
  }
  $repoId = $repo.id
  Write-Ok "仓库就绪：$repoId"

  # 3) 仓库导入完成，基础快照会在用户浏览代码时自动创建
  Write-Info "仓库导入完成，基础快照将在用户首次浏览代码时自动创建"
  Write-Info "主要分支：$BaseBranch"
  if(-not [string]::IsNullOrWhiteSpace($FeatureBranch)){
    Write-Info "功能分支：$FeatureBranch"
  }

  # 4) Diff 创建功能已移除（产品聚焦 评论+社区）
  #    如需代码对比，请到 GitHub 进行 PR/Compare 操作

  Write-Host ""; Write-Ok "✅ 导入完成！"
  Write-Host ""
  Write-Host "📋 导入结果:" -ForegroundColor Cyan
  Write-Host "   仓库ID: $repoId"
  Write-Host "   仓库名: $($repo.name)"
  Write-Host "   Git URL: $($repo.gitUrl)"
  Write-Host "   默认分支: $BaseBranch"
  Write-Host ""
  Write-Host "🌐 访问链接:" -ForegroundColor Yellow
  Write-Host "   仓库详情: http://localhost:3000/repositories/$repoId"
  Write-Host ""
  Write-Host "💡 下一步:" -ForegroundColor Green
  Write-Host "   1. 打开浏览器访问上述链接"
  Write-Host "   2. 点击分支的'浏览代码'按钮（系统会自动创建快照）"
  Write-Host "   3. 在代码文件中添加评论进行协作"
}

Main
