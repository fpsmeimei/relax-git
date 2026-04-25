# Relax-Git Graduation Specs

本目录用于固定本阶段开发目标，避免项目继续在功能、叙事和实现范围上发散。

当前阶段的总目标不是继续堆功能，而是把 Relax-Git 收敛成一个适合本科毕业设计答辩、可稳定演示、易于讲解的开发者代码社交平台。

## 本阶段总原则

1. 不直接在 `master` 上开发。
2. 所有变更都必须围绕毕业设计主线展开。
3. 功能优先级遵循“平台主线 > 社交闭环 > 成品感 > 加分项”。
4. 专用仓库发现 AI 助手保留，但只作为辅助亮点，不再扩成复杂主系统。
5. 文档先于大改动，所有重要收缩和新增都要先对照本目录中的 spec。

## 当前工作分支

- `fpsmeimei/specs/graduation-streamline-plan`

这个分支用于沉淀本轮收缩与建设的规范文档，不直接承担全部实现工作。

## 推荐后续任务分支

- `fpsmeimei/cleanup/repo-hygiene`
- `fpsmeimei/feature/defense-streamline`
- `fpsmeimei/feature/ops-console-lite`
- `fpsmeimei/chore/local-demo-readiness`

说明：

- `master` 仅保留与 `origin/master` 同步的干净状态。
- 新功能与清理工作从专门任务分支推进。
- 合并顺序建议为：仓库清理 -> 项目瘦身 -> 控制台 -> 本地演示稳定性收口。

## 毕设主线

建议统一对外表述为：

`面向开发者的代码社交平台设计与实现`

更完整的对外描述为：

`Relax-Git 是一个以开源仓库为内容载体、以代码快照和行级讨论为核心互动方式的开发者代码社交平台。`

项目核心能力保留为：

1. 仓库导入与基础管理。
2. 社区 feed 与仓库内容分发。
3. 基础快照 / 会话快照与代码浏览。
4. 围绕仓库与代码行的评论互动。
5. 开发者关系与轻量私聊。
6. 通知与个人中心。

辅助亮点保留为：

1. 专用仓库发现 AI 助手。
2. 简洁实用的运营管理控制台。
3. 本地可稳定运行的演示环境与答辩材料。

## 文档清单

- [01-git-governance.md](/Users/fpsmeimei/Projects/relax-git/specs/graduation-streamline-plan/01-git-governance.md)
- [02-repo-cleanup.md](/Users/fpsmeimei/Projects/relax-git/specs/graduation-streamline-plan/02-repo-cleanup.md)
- [02a-cleanup-inventory.md](/Users/fpsmeimei/Projects/relax-git/specs/graduation-streamline-plan/02a-cleanup-inventory.md)
- [03-project-streamline.md](/Users/fpsmeimei/Projects/relax-git/specs/graduation-streamline-plan/03-project-streamline.md)
- [03a-streamline-inventory.md](/Users/fpsmeimei/Projects/relax-git/specs/graduation-streamline-plan/03a-streamline-inventory.md)
- [03b-social-platform-positioning.md](/Users/fpsmeimei/Projects/relax-git/specs/graduation-streamline-plan/03b-social-platform-positioning.md)
- [03c-feature-scope-checklist.md](/Users/fpsmeimei/Projects/relax-git/specs/graduation-streamline-plan/03c-feature-scope-checklist.md)
- [04-ops-console-lite.md](/Users/fpsmeimei/Projects/relax-git/specs/graduation-streamline-plan/04-ops-console-lite.md)
- [05-vps-deployment.md](/Users/fpsmeimei/Projects/relax-git/specs/graduation-streamline-plan/05-vps-deployment.md)
