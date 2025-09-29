# 废弃快照代码存档

本目录包含在快照架构统一过程中被废弃的代码文件，保留作为参考。

## 废弃时间

2025-09-26

## 废弃原因

快照架构统一：将四种快照类型（BaseSnapshot、SessionSnapshot、Snapshot、SnapshotArtifact）统一为单一的BaseSnapshot类型。

## 废弃的文件

### 控制器

- `session-snapshot.controller.ts` - 会话快照控制器，已被 UnifiedSnapshotsController 替代
- `snapshots.controller.ts` - 传统快照控制器，已被 UnifiedSnapshotsController 替代

### 服务

- `session-snapshot.service.ts` - 会话快照服务，已被 UnifiedSnapshotService 替代
- `snapshots.service.ts` - 传统快照服务，已被 UnifiedSnapshotService 替代

## 替代方案

### API端点迁移

- `POST /session-snapshots/:repoId/branches/:branchId` →
  `POST /snapshots/session/:repoId/branches/:branchId`
- `GET /session-snapshots/:id` → `GET /snapshots/:id`
- `GET /session-snapshots/:id/tree` → `GET /snapshots/:id/tree`
- `GET /session-snapshots/:id/file` → `GET /snapshots/:id/file`
- `POST /session-snapshots/:id/extend` → `POST /snapshots/:id/extend`

### 服务替代

- `SessionSnapshotService` → `UnifiedSnapshotService`
- `SnapshotsService` → `UnifiedSnapshotService`

## 注意事项

- 这些文件仅作为参考保留，不应在生产代码中使用
- 如需恢复某些功能，请参考统一服务的实现
- 所有权限验证已迁移到 UnifiedSnapshotAccessService
