# 🛠️ Relax-Git 开发工具

本目录包含 Relax-Git 项目的开发工具和脚本。

## 📁 工具结构

### [scripts/](scripts/)

开发和部署脚本：

- `cleanup-temp.js` - 清理临时文件
- `db-setup.js` - 数据库初始化
- `fix-audit-types.js` - 修复审计类型
- `fix-imports.js` - 修复导入问题
- `health-check.js` - 健康检查
- `import-github-repo.ps1` - GitHub 仓库导入
- `setup-mcp.ps1` - MCP 设置脚本

## 🚀 使用方法

### 数据库设置

```bash
node tools/scripts/db-setup.js
```

### 健康检查

```bash
node tools/scripts/health-check.js
```

## 📖 相关文档

- [项目主页](../README.md)
- [开发文档](../docs/)
- [示例项目](../examples/)
