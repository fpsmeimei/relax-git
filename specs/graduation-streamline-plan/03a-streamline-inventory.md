# Spec 03A: 产品表达瘦身盘点

## 目的

本文件记录前端页面结构、主导航和产品叙事中的“分散注意力项”，用于指导 `Spec 03` 的具体实施。

目标不是删除所有边缘能力，而是让用户和答辩老师更容易看懂“代码社交平台”的主线。

## 当前页面结构概览

当前 `apps/web/src/app` 下仍包含以下主要路由组：

1. 认证：`/auth/login`、`/auth/register`
2. 社区：`/`、`/community`、`/community/[id]`
3. 仓库：`/repositories`、`/repositories/import`、`/repositories/[id]`
4. 快照：`/snapshots/[id]`
5. 个人中心：`/me`、`/me/comments`、`/me/replies`、`/me/settings`
6. 聊天相关：`/chat`、`/chat/[id]`、`/chat/bot`、`/chatroom`
7. 其他：`/about`、`/search`、`/messages`

从毕设叙事角度看，主线已经存在，但部分页面关系仍未被明确分层。

## 当前主链路

真正适合放在答辩主线里的页面应是：

1. 社区页
2. 社区仓库详情页
3. 导入仓库页
4. 我的仓库页
5. 仓库详情页
6. 快照浏览页
7. 聊天相关页中的私聊页
8. 个人中心页
9. 控制台页

这条链路已经足够支撑“发现仓库 -> 浏览仓库 -> 深入代码 -> 互动讨论 -> 建立连接 -> 回到社区”的完整故事。

## 当前分散注意力的页面

### 1. `about`

问题：

1. 页面仍然带有较强营销展示气质。
2. 功能介绍中对聊天等能力的强调偏重。
3. 与当前“毕业设计演示平台”定位不完全一致。

建议：

1. 降低其曝光度。
2. 后续可改为更克制的“项目介绍页”。

### 2. `chatroom` / `chat` / `chat/bot`

问题：

1. 聊天能力需要保留，但不同聊天路由的定位不够清楚。
2. `/chat`、`/chatroom`、`/chat/bot` 多入口容易让系统主题显得分叉。

当前状态更新：

1. 顶栏主导航已移除聊天室入口。
2. `/messages` 已成为真实消息中心页面。
3. `/chat`、`/chat/bot`、`/chatroom` 已退为兼容跳转层。
4. 聊天功能保留，但后续需要区分“必备私聊”和“可冻结扩展”。
5. `about` 页面已由营销展示页改写为更克制的“毕业设计项目介绍页”。
6. `/chat/[id]` 已退为兼容跳转层，真实私信线程入口统一收口到 `/messages?chat=...`。

建议：

1. `chat` 与 `chat/[id]` 仅保留为兼容入口，不再作为公开主入口表达。
2. `chatroom` 不再作为业务主页面，只保留兼容跳转并进入冻结名单。
3. `chat/bot` 不再作为普通聊天入口表达，而应转向“仓库发现助手”。

### 3. `messages`

当前状态更新：

1. `messages` 页面已升级为真实消息中心页面。
2. 旧消息入口统一收口到 `/messages`，不再保留一个“开发中但公开可见”的半成品页面。
3. 会话详情入口也已并入 `/messages?chat=...`，避免继续维持平行“聊天详情页”心智。

建议：

1. 继续以 `/messages` 作为唯一消息中心表达。
2. 后续仅保留兼容跳转，不再新增平行聊天入口。

### 4. `search`

问题：

1. 功能本身有价值，但更适合服务“找仓库”而不是独立成一条业务主线。
2. 后续可与专用 AI 助手一起整合为“仓库发现能力”。

## 当前主导航状态

本轮已完成第一轮收缩：

1. 全局顶栏已移除聊天室主入口。
2. 顶栏聚焦为：`Relax-Git / 社区 / 导入仓库 / 我的仓库`
3. 认证页的品牌回跳已从 `/about` 改为首页主入口 `/`
4. `about` 页面已收敛为项目说明页，不再强调聊天等边缘能力
5. 旧的聊天/消息导航组件已从源码中移除

这一步的价值在于：

1. 产品第一印象更聚焦代码社交主线。
2. 聊天不再抢占用户注意力。
3. 登录流程与主舞台重新对齐。

## 下一步可选收缩动作

### A. 低风险继续收缩

1. 继续弱化 `messages` 页面或移除其独立存在感。
2. 统一聊天相关入口，避免多路由重复表达。
3. 将 `chat/bot` 转化为“专用仓库 AI”语义。
4. 明确 `chatroom` 是否进入冻结名单。

当前状态更新：

1. 第 1 项已调整为“将 `/messages` 固化为唯一消息中心表达”并已完成。
2. 第 2、3 项已完成第一轮收口。
3. 第 4 项进入兼容保留阶段，等待后续版本彻底下线。

## 代码层残留观察

当前还存在几个已经不再被主界面使用的旧导航组件：

当前状态更新：

1. [apps/web/src/components/layout/nav-chat-link.tsx](/Users/fpsmeimei/Projects/relax-git/apps/web/src/components/layout/nav-chat-link.tsx)
   已删除
2. [apps/web/src/components/nav-chat-link.tsx](/Users/fpsmeimei/Projects/relax-git/apps/web/src/components/nav-chat-link.tsx)
   已删除
3. [apps/web/src/components/nav-messages-link.tsx](/Users/fpsmeimei/Projects/relax-git/apps/web/src/components/nav-messages-link.tsx)
   已删除
4. `chat/[id]` 页面中的历史说明也已同步改为页面级 socket 语义
5. 前端消息中心相关组件目录已从 `components/chat/*` 收口到 `components/messages/*`
6. 前端状态管理主链已开始从 `chat-*` 收口到
   `messages-store`、`contacts-store`、`use-messages-socket`、`types/messages`
7. 后端 `chats`
   模块暂不做目录级重命名，继续保留兼容命名以避免牵动接口路径、WebSocket 事件名与 Prisma 模型联动

### B. 进入新增能力阶段

1. 在现有更聚焦的导航结构上，增加“控制台”入口。
2. 把“开发者掌控力”放到新的次级但正式入口中。

## 当前结论

前端表达层已经完成第一步：

`先收主导航，再收次级页面。`

这意味着项目已经从“多功能并列展示”开始转向“主链路优先展示”，符合毕业设计收束方向。

下一步应进一步明确：

1. 哪些社交能力属于平台核心。
2. 哪些社交能力属于可冻结扩展。
3. AI 应该以“仓库发现助手”而不是“泛聊天入口”出现。
