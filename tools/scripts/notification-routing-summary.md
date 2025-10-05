# 通知系统跳转逻辑总结

## 评论类型与跳转规则

通知系统现在能够根据评论的 `anchorType` 和其他属性，智能地跳转到正确的页面位置：

### 1. 社区评论 (`PROJECT`)

- **特征**: `anchorType === 'PROJECT'`
- **页面**: 社区卡片评论区
- **跳转URL**: `/community?repoId={repoId}&commentId={commentId}`
- **示例**: `/community?repoId=cmgcpj5ju0005imi9n9duxzt8&commentId=cmgdxxrhu0009m0p5zgexla7r`

### 2. 项目讨论评论 (`SNAPSHOT` 无文件路径)

- **特征**: `anchorType === 'SNAPSHOT'` 且 `filePath` 为空
- **页面**: 项目讨论页面
- **跳转URL**: `/repositories/{repoId}?tab=discussion&commentId={commentId}`
- **示例**: `/repositories/cmgcpj5ju0005imi9n9duxzt8?tab=discussion&commentId=abc123`

### 3. 行级评论 (`LINE`)

- **特征**: `anchorType === 'LINE'` 且有 `filePath` 和 `lineStart`
- **页面**: 代码快照页面的具体行
- **跳转URL**: `/snapshots/{snapshotId}?file={filePath}&line={lineStart}&commentId={commentId}`
- **示例**: `/snapshots/abc123?file=src/App.tsx&line=42&commentId=def456`

### 4. 快照级评论 (其他情况)

- **特征**: 其他 `anchorType` 或有 `snapshotId` 的情况
- **页面**: 代码快照页面
- **跳转URL**: `/snapshots/{snapshotId}?commentId={commentId}`
- **示例**: `/snapshots/abc123?commentId=def456`

## 技术实现

### 后端 API 增强

- `notifications.service.ts`: 返回评论的 `anchorType` 和仓库信息
- 包含完整的评论上下文数据

### 前端跳转逻辑

- `apps/web/src/app/me/page.tsx`: 智能跳转逻辑
- 根据评论类型生成正确的 URL

### 数据结构

```typescript
interface NotificationDto {
  comment?: {
    anchorType?: 'SNAPSHOT' | 'PROJECT' | 'COMMIT' | 'FILE' | 'LINE';
    filePath?: string | null;
    lineStart?: number | null;
    snapshot?: {
      repository?: {
        id: string;
        name: string;
      };
    };
  };
}
```

## 测试验证

使用 `test-notification-api.js` 脚本可以验证：

1. API 返回的数据结构是否正确
2. 跳转 URL 生成逻辑是否准确
3. 不同类型评论的处理是否符合预期

## 使用说明

1. 重启后端服务以应用 API 修复
2. 刷新前端通知页面
3. 点击通知的"查看详情"按钮
4. 系统会自动跳转到正确的页面位置并定位到对应评论
