# Spec 02A: 仓库清理盘点

## 目的

本文件记录当前仓库中已经确认的“垃圾数据 / 脏数据 / 可疑历史残留”，用于指导 `Spec 02` 的具体执行。

这份文档的重点不是立刻删除所有东西，而是先分清：

1. 哪些是可以直接删的。
2. 哪些需要先确认再删。
3. 哪些暂时应保留，但要降噪或重新归类。

## 当前扫描结论

仓库目前同时存在两类问题：

1. 已被 Git 跟踪的历史垃圾文件。
2. 本地生成但未跟踪的运行产物与缓存目录。

第二类虽然不一定会被提交，但会严重影响目录观感和开发判断，同样需要治理。

## A 类：建议优先删除的已跟踪垃圾

这些文件高度疑似历史残留，对当前主链路没有直接价值：

1. [apps/worker/worker.exe](/Users/fpsmeimei/Projects/relax-git/apps/worker/worker.exe)
2. [apps/web/src/components/snapshot/line-comment-inline-panel.tsx.backup](/Users/fpsmeimei/Projects/relax-git/apps/web/src/components/snapshot/line-comment-inline-panel.tsx.backup)
3. [backups](/Users/fpsmeimei/Projects/relax-git/backups)
   整个目录下的历史报告、旧迁移导出、`.backup` 文件

理由：

1. `worker.exe` 明显是平台专属构建产物，不适合作为仓库源码的一部分长期保留。
2. `.backup` 文件属于手工备份痕迹，应由 Git 历史承担版本回溯，而不是继续留在源码树中。
3. `backups/` 当前更像一次性操作遗留，而不是项目稳定运行的依赖。

## B 类：建议立即清空的未跟踪垃圾

这些内容是本地运行产物，不应长期占据仓库视野：

1. [apps/api/dist](/Users/fpsmeimei/Projects/relax-git/apps/api/dist)
2. [apps/web/.next](/Users/fpsmeimei/Projects/relax-git/apps/web/.next)
3. 各级 `.DS_Store`

说明：

1. 根级 `.gitignore` 和 Web 子应用 `.gitignore` 已覆盖 `dist/`、`.next/`、`.DS_Store`。
2. 这些内容当前主要是本地运行后遗留，没有保留价值。

## C 类：建议人工判断后清理的可疑调试资产

### 1. `apps/web/public` 下的调试页

当前可见：

1. [clear-auth.html](/Users/fpsmeimei/Projects/relax-git/apps/web/public/clear-auth.html)
2. [debug-auth.html](/Users/fpsmeimei/Projects/relax-git/apps/web/public/debug-auth.html)
3. [test-login.html](/Users/fpsmeimei/Projects/relax-git/apps/web/public/test-login.html)

判断：

这些更像阶段性调试工具，而不是答辩需要的正式页面。建议确认前端当前是否还依赖它们做认证排障；若无依赖，可整体移除。

### 2. `tools/scripts` 中大量 `debug-*` / `test-*` / `fix-*` 脚本

这类脚本数量明显偏多，已影响仓库的“掌控感”：

1. 多个聊天通知调试脚本
2. 多个临时修复脚本
3. 多个社交功能测试脚本
4. 零散 SQL 与一次性操作脚本

判断：

不建议一次性全删，但应做一次分类：

1. 保留真正有复用价值的运维脚本。
2. 将一次性排障脚本移出主脚本目录，或删除。
3. 尽量把“测试资产”收敛到正式测试体系，而不是散落在 `tools/scripts/`。

## D 类：建议弱化或归档说明的目录

### 1. [archive](/Users/fpsmeimei/Projects/relax-git/archive)

当前几乎没有有效内容，只看到 `.DS_Store`。

判断：

如果没有计划重新用作归档目录，建议直接删除整个空壳目录。

### 2. `backups/` 中的历史简化/迁移报告

包括：

1. dependency check 报告
2. frontend simplification 报告
3. module optimization 报告
4. snapshot/simple migration 临时导出

判断：

这些内容更适合存在于外部工作记录，不适合继续混在主仓库内。

### 3. `tools/scripts` 目录整体过于臃肿

当前扫描结果显示，`tools/scripts` 下共有 53 个文件，但真正挂在根 `package.json`
中作为常用入口暴露的只有 4 个：

1. `cleanup-temp.js`
2. `db-setup.js`
3. `health-check.js`
4. `lint-garbled.js`

其余文件大致可分为：

1. `inspection` 类 7 个
2. `debug` 类 10 个
3. `test_like` 类 15 个
4. `one_off_ops` 类 12 个
5. `other` 类 5 个

这说明当前脚本目录已经明显偏向“排障仓库”，而不是“稳定工具入口”。

判断：

1. 短期内不建议粗暴全删。
2. 但非常适合在下一轮做“脚本目录瘦身”。
3. 最合理的方向是只保留正式运维/启动脚本，把历史排障脚本移出主目录或删除。

当前状态更新：

1. 脚本目录已完成第一轮瘦身。
2. 当前仅保留 `cleanup-temp.js`、`db-setup.js`、`health-check.js`、`lint-garbled.js` 4 个核心脚本。
3. `tools/README.md` 已同步更新为与当前实际状态一致。

## E 类：目前先保留的内容

以下内容虽然可能显得“杂”，但暂时不建议贸然删除：

1. [tools/scripts/db-setup.js](/Users/fpsmeimei/Projects/relax-git/tools/scripts/db-setup.js)
2. [tools/scripts/health-check.js](/Users/fpsmeimei/Projects/relax-git/tools/scripts/health-check.js)
3. [tools/scripts/cleanup-temp.js](/Users/fpsmeimei/Projects/relax-git/tools/scripts/cleanup-temp.js)
4. 与正式启动、数据库初始化、健康检查直接相关的脚本

原因：

这些更可能属于仍在使用的本地演示链路，不应为了“看起来干净”而误删。

## 第一批清理建议

建议先做最稳的一批：

1. 删除所有 `.DS_Store`
2. 删除未跟踪的 `apps/api/dist` 与 `apps/web/.next`
3. 删除已跟踪的 `apps/worker/worker.exe`
4. 删除已跟踪的 `.backup` 文件与 `line-comment-inline-panel.tsx.backup`
5. 删除空壳 `archive/`
6. 清空或移除 `backups/`
7. 删除公开暴露的前端调试 HTML 页面
8. 将 `tools/scripts` 收缩为核心运行脚本集合

这批动作对“项目更干净、答辩更聚焦”的帮助最大，而且对主链路运行风险相对最低。

## 第二批清理建议

在第一批完成后，再处理：

1. `apps/web/public` 下的调试页
2. `tools/scripts` 中的调试脚本与一次性修复脚本
3. 乱码注释与低质量说明文本

当前状态更新：

1. 第 1 项已完成。
2. 第 2 项已完成第一轮核心清理。
3. 源码与页面层面的第二批清理已开始推进，已移除一批运行时调试日志、点击埋点式
   `console.log`、状态重置噪音与旧认证调试输出。
4. Redis 初始化、好友状态拉取、WebSocket 连接链路中的低价值运行时日志已继续收口。
5. 旧 `simpleAuth` 本地认证残留与 `storage-cleaner`
   旧 token 清理工具已从代码面移除，避免继续干扰当前真实登录链路。
6. 前端消息中心相关目录、store、hook、types 已继续向 `messages / contacts`
   命名收口，降低“旧聊天项目”观感。
7. 后端 `chats`
   模块已评估为高联动区域，当前更适合保留兼容命名，只继续收口注释、提示文案与实现级噪音。
8. 下一步更适合只保留失败诊断必需日志，并继续处理少量历史命名残留。

这批动作更适合结合“毕设导向瘦身”一起做。

## 当前最重要结论

如果只允许先做一轮最小清理，那么最值得优先处理的是：

1. `backups/`
2. `archive/`
3. `worker.exe`
4. `.backup` 文件
5. `.DS_Store`
6. 本地构建产物目录
7. 公开调试 HTML 页面

这几类内容最像“遗留垃圾”，而不是“系统能力”。
