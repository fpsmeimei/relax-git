# Spec 01: Git 治理与分支纪律

## 目标

让本地与远程仓库关系清晰、开发入口单一、后续改造不再直接污染 `master`。

## 当前状态结论

本轮检查得到的事实：

1. `origin/master` 已前进到最新提交。
2. 本地旧提交 `c44c1bf` 已以新的远程提交形式被合入，不再需要作为独立基线保留。
3. 本地开发应以最新 `origin/master` 为基线。
4. 当前已创建新的工作分支：`fpsmeimei/specs/graduation-streamline-plan`。

## 已执行治理动作

1. 抓取远程并清理过期远程引用：`git fetch --all --prune`
2. 将当前 spec 分支对齐到最新 `origin/master`
3. 将本地 `master` 对齐并重新绑定到 `origin/master`
4. 停止继续在 `master` 上直接修改

## 后续规则

1. `master` 只做同步，不做开发。
2. 任何开发动作必须从任务分支发起。
3. 每个任务分支只承担一个清晰目标，避免“清理 + 新功能 + 部署”混在同一条分支里。
4. 文档先行，先更新或确认对应 spec，再进行较大代码改动。
5. 合并前必须做最少一轮本地可运行验证。

## 分支建议

### 文档与总体设计

- `fpsmeimei/specs/graduation-streamline-plan`

### 仓库清理

- `fpsmeimei/cleanup/repo-hygiene`

### 毕设导向瘦身

- `fpsmeimei/feature/defense-streamline`

### 运营管理控制台

- `fpsmeimei/feature/ops-console-lite`

### 本地演示收口

- `fpsmeimei/chore/local-demo-readiness`

## 不在本轮自动执行的远程治理

以下动作具有共享风险，本轮只记录，不自动执行：

1. 删除远程历史分支。
2. 重写远程历史。
3. 调整 fork 仓库分支布局。

如需继续压缩远程分支数量，应在确认远程分支仍无用途后再做。

## 验收标准

1. 本地存在明确的非 `master` 工作分支。
2. 本地 `master` 与 `origin/master` 保持一致。
3. 未来开发有明确的任务分支命名规范。
4. 项目开发流程不再依赖“直接在 master 上改代码”。
