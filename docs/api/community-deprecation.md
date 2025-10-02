# 社区接口迁移与弃用说明

本说明用于指导将旧的仓库社区相关端点迁移至统一的 `/api/community` 新端点，并明确弃用计划与验证步骤。

## 背景

为对齐数据库 Schema（项目级评论 `CommentAnchorType.PROJECT` +
`BaseSnapshot`）与前后端调用，避免排序/分页与并发问题，社区模块完成了统一与修复：

- 项目级评论统一到 `PROJECT`，移除 `REPOSITORY/anchorKey`
  路径及对不存在列（`deletedAt/likesCount`）的读写。
- Feed 与评论列表采用稳定排序 + 复合游标。
- 点赞/收藏封装于 `prisma.$transaction` 并通过 `count()` 回填计数。
- 匿名访问：Feed、仓库详情、评论列表标注 `@Public()`。

## 端点映射

| 场景         | 旧端点                                             | 新端点（保留）                                               |
| ------------ | -------------------------------------------------- | ------------------------------------------------------------ |
| 获取 Feed    | `GET /api/repositories/feed`（如存在）             | `GET /api/community/feed`                                    |
| 仓库详情     | `GET /api/repositories/:id`（如存在）              | `GET /api/community/repositories/:id`                        |
| 记录浏览     | `POST /api/repositories/:id/view`                  | `POST /api/community/repositories/:id/view`                  |
| 获取评论列表 | `GET /api/repositories/:id/comments`               | `GET /api/community/repositories/:id/comments`               |
| 创建评论     | `POST /api/repositories/:id/comments`              | `POST /api/community/repositories/:id/comments`              |
| 删除评论     | `DELETE /api/repositories/:id/comments/:commentId` | `DELETE /api/community/repositories/:id/comments/:commentId` |
| 评论点赞     | `POST /api/repositories/comments/:commentId/like`  | `POST /api/community/repositories/comments/:commentId/like`  |
| 仓库点赞     | `POST /api/repositories/:id/like`                  | （保持原路径，控制器归属为仓库互动）                         |
| 仓库收藏     | `POST /api/repositories/:id/collect`               | （保持原路径，控制器归属为仓库互动）                         |

说明：旧评论端点仍保留为兼容别名，并由 `RepositoryInteractionController` 记录 `warn`
日志后转发到新端点。下一版本将移除。

## 请求与响应要点

- 评论计数不再使用 `Comment.likesCount` 列（Schema 无此列），统一用 `CommentLike.count()` 返回。
- Feed 返回新增 `commentsCount` 字段，为该仓库项目级顶级评论的聚合计数。
- Feed 支持 `search`（`name/description`，不区分大小写）、`tags`、`language` 过滤。
- 浏览统计优先使用 `X-Forwarded-For`，后端已配置 `trustProxy: true`。

## 前端迁移建议

- API 客户端统一使用同源 `/api` 代理（`NEXT_PUBLIC_API_URL=/api` + `next.config.js rewrites`）。
- 将评论相关请求切换到 `/api/community/...`，并保留 401 匿名兜底重试逻辑。
- `RepositoryCard` 使用 `commentsCount`
  展示真实评论数；浏览打点曝光与点击二选一（客户端去重 + 服务端 1 小时去重）。

## 验证清单

- 匿名可加载 Feed、仓库详情与评论列表（无 401 循环）。
- 评论创建/删除/点赞不再出现 `anchorKey/snapshot/likesCount` 相关错误。
- Feed 与评论列表分页稳定（无重复/遗漏）。
- 点赞/收藏在并发下无计数漂移。
- 浏览统计按 1 小时去重；定时任务正常运行并定期更新 `trendingScore`。

## 弃用计划

- 当前版本：旧评论端点仍可用，但会打印 `warn` 日志；功能由新端点承载。
- 下一个小版本：移除旧评论端点；文档与客户端均切换至新端点。

## 相关文件

- 后端
  - `apps/api/src/community/community.controller.ts`
  - `apps/api/src/community/community.service.ts`
  - `apps/api/src/community/repository-interaction.controller.ts`
  - `apps/api/src/community/repository-interaction.service.ts`
  - `apps/api/src/community/views-aggregation.service.ts`
- 前端
  - `apps/web/src/lib/api/community.ts`
  - `apps/web/src/components/community/repository-card.tsx`
  - `apps/web/src/app/community/page.tsx`

---

如需扩展搜索到标签（`tags hasSome`）或增加评论总数到仓库详情接口，可继续在 `CommunityService`
中按需补充。
