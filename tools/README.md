# 🛠️ Relax-Git 开发工具

本目录包含 Relax-Git 项目当前仍在维护的开发工具和脚本。

## 📁 工具结构

### [scripts/](scripts/)

当前保留的核心脚本：

- `cleanup-temp.js` - 清理临时文件
- `db-setup.js` - 数据库初始化
- `health-check.js` - 健康检查
- `lint-garbled.js` - 检查 apps 目录中的疑似乱码文本

历史调试脚本、一次性修复脚本和临时测试脚本已从仓库中移除，避免干扰当前主链路开发与毕业设计答辩叙事。

这个目录只保留 macOS 工作流和当前项目运行仍需要的脚本，`tools/scripts/` 下的命令都以 `node` 或
`bash` 方式直接运行。

## 🚀 使用方法

### 数据库设置

```bash
node tools/scripts/db-setup.js
```

### 健康检查

```bash
node tools/scripts/health-check.js
```

### 乱码检查

```bash
node tools/scripts/lint-garbled.js
```

## 📖 相关文档

- [项目主页](../README.md)
