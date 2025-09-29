# Relax-Git 快照架构统一迁移指南

## 概述

本文档描述了 Relax-Git 快照架构从多类型快照系统统一为单一快照类型的迁移过程。

## 迁移背景

### 原有架构问题

- **复杂性**: 四种快照类型（BaseSnapshot、SessionSnapshot、Snapshot、SnapshotArtifact）
- **权限混乱**: 不同快照类型使用不同的权限验证机制
- **API分散**: 多个API端点，前端逻辑复杂
- **维护困难**: 重复代码，难以维护和扩展

### 统一架构优势

- **简化架构**: 单一快照类型，统一数据模型
- **权限统一**: 统一的权限验证机制
- **API一致**: 统一的API端点和响应格式
- **易于维护**: 减少重复代码，提高可维护性

## 架构变更

### 数据模型变更

#### BaseSnapshot 模型扩展

```prisma
model BaseSnapshot {
  id                String   @id @default(cuid())
  repoId            String
  branchId          String
  commitSha         String
  status            BaseSnapshotStatus @default(QUEUED)
  worktreePath      String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // 统一快照新增字段
  ownerId           String?   // 快照所有者
  title             String?   // 快照标题
  description       String?   // 快照描述
  expiresAt         DateTime? // 过期时间
  lastAccessedAt    DateTime? // 最后访问时间
  accessCount       Int       @default(0) // 访问次数

  // 关系
  repository        Repository @relation(fields: [repoId], references: [id], onDelete: Cascade)
  branch            Branch     @relation(fields: [branchId], references: [id], onDelete: Cascade)
  owner             User?      @relation(fields: [ownerId], references: [id], onDelete: SetNull)

  @@unique([repoId, branchId])
  @@index([ownerId])
  @@index([expiresAt])
  @@index([lastAccessedAt])
}
```

### API端点变更

#### 统一API端点

| 功能         | 原端点                                               | 新端点                                               |
| ------------ | ---------------------------------------------------- | ---------------------------------------------------- |
| 获取快照详情 | `GET /session-snapshots/:id`                         | `GET /snapshots/:id`                                 |
| 获取文件树   | `GET /session-snapshots/:id/tree`                    | `GET /snapshots/:id/tree`                            |
| 获取文件内容 | `GET /session-snapshots/:id/file`                    | `GET /snapshots/:id/file`                            |
| 创建会话快照 | `POST /session-snapshots/:repoId/branches/:branchId` | `POST /snapshots/session/:repoId/branches/:branchId` |
| 延长TTL      | `POST /session-snapshots/:id/extend`                 | `POST /snapshots/:id/extend`                         |

#### 向后兼容

- 保留废弃端点的兼容性控制器
- 所有废弃端点标记为 `@deprecated`
- 逐步引导用户迁移到新端点

### 服务架构变更

#### 统一服务

- **UnifiedSnapshotService**: 核心统一快照服务
- **UnifiedSnapshotAccessService**: 统一权限验证服务
- **UnifiedSnapshotsController**: 统一API控制器

#### 废弃服务

- ~~SessionSnapshotService~~ → UnifiedSnapshotService
- ~~SnapshotsService~~ → UnifiedSnapshotService
- ~~SessionSnapshotController~~ → UnifiedSnapshotsController
- ~~SnapshotsController~~ → UnifiedSnapshotsController

## 迁移步骤

### 1. 数据库迁移

```sql
-- 扩展BaseSnapshot表
ALTER TABLE "BaseSnapshot" ADD COLUMN "ownerId" TEXT;
ALTER TABLE "BaseSnapshot" ADD COLUMN "title" TEXT;
ALTER TABLE "BaseSnapshot" ADD COLUMN "description" TEXT;
ALTER TABLE "BaseSnapshot" ADD COLUMN "expiresAt" TIMESTAMP(3);
ALTER TABLE "BaseSnapshot" ADD COLUMN "lastAccessedAt" TIMESTAMP(3);
ALTER TABLE "BaseSnapshot" ADD COLUMN "accessCount" INTEGER NOT NULL DEFAULT 0;

-- 添加索引
CREATE INDEX "BaseSnapshot_ownerId_idx" ON "BaseSnapshot"("ownerId");
CREATE INDEX "BaseSnapshot_expiresAt_idx" ON "BaseSnapshot"("expiresAt");
CREATE INDEX "BaseSnapshot_lastAccessedAt_idx" ON "BaseSnapshot"("lastAccessedAt");

-- 添加外键约束
ALTER TABLE "BaseSnapshot" ADD CONSTRAINT "BaseSnapshot_ownerId_fkey"
FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
```

### 2. 服务迁移

1. 部署统一服务
2. 更新模块配置
3. 测试新API端点
4. 逐步移除废弃服务

### 3. 前端迁移

1. 更新API调用端点
2. 简化快照类型检测逻辑
3. 统一错误处理
4. 测试用户界面

### 4. 清理工作

1. 移除废弃代码
2. 更新文档
3. 清理测试用例
4. 更新部署脚本

## 兼容性说明

### 向后兼容

- 废弃的API端点仍然可用，但会返回deprecation警告
- 现有的前端代码在迁移期间仍可正常工作
- 数据库中的现有数据保持兼容

### 迁移时间表

- **Phase 1**: 部署统一服务（已完成）
- **Phase 2**: 前端逐步迁移（已完成）
- **Phase 3**: 废弃代码清理（进行中）
- **Phase 4**: 完全移除废弃端点（计划中）

## 测试指南

### API测试

```bash
# 测试统一端点
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/snapshots/$SNAPSHOT_ID

# 测试文件树获取
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/snapshots/$SNAPSHOT_ID/tree

# 测试文件内容获取
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3001/snapshots/$SNAPSHOT_ID/file?path=README.md"
```

### 前端测试

1. 验证快照浏览功能
2. 确认不再出现403权限错误
3. 测试会话快照创建和TTL延长
4. 验证错误处理逻辑

## 故障排除

### 常见问题

#### 1. 403权限错误

**原因**: 前端仍在使用废弃的API端点 **解决**: 更新前端代码使用统一端点

#### 2. 快照创建失败

**原因**: BaseSnapshot服务未正确配置 **解决**: 检查BaseSnapshot服务状态和配置

#### 3. 文件访问失败

**原因**: 工作树路径配置问题 **解决**: 验证快照工作树路径和权限

### 日志监控

```bash
# 监控统一服务日志
tail -f logs/unified-snapshot.log

# 监控权限验证日志
tail -f logs/unified-access.log

# 监控API请求日志
tail -f logs/api.log | grep "snapshots"
```

## 性能优化

### 缓存策略

- 快照元数据缓存
- 文件树结构缓存
- 权限验证结果缓存

### 数据库优化

- 添加必要索引
- 优化查询语句
- 定期清理过期数据

## 安全考虑

### 权限验证

- 统一的权限验证机制
- 基于角色的访问控制
- 审计日志记录

### 数据保护

- 敏感数据加密
- 访问日志记录
- 定期安全审计

## 总结

快照架构统一迁移简化了系统复杂性，提高了可维护性和用户体验。通过渐进式迁移策略，确保了系统的稳定性和向后兼容性。

## 相关文档

- [API文档](../api/snapshots.md)
- [开发指南](../development/snapshots.md)
- [部署指南](../deployment/snapshots.md)
