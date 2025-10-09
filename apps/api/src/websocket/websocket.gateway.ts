import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway as WSGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import {
  TimelineEventType,
  UserRole,
} from '@relax-git/shared/generated/prisma-client';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../redis/redis.service';
// 注意：此处不要重复导入 RepositoryVisibility/TimelineEventType/UserRole，也不要导入尚未生成的 ChatType/ChatMemberRole

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: UserRole;
  user?: {
    id: string;
    username: string;
    role: UserRole;
  };
  connectedAt?: number;
}

/**
 * WebSocket网关
 * 处理实时通信和事件推送
 * 应届生学习项目版本：简化实现，重点学习WebSocket基础
 */
@WSGateway({
  // 不指定 port，附着在 Nest HTTP 服务器（4000）上，路径为 /socket.io
  path: '/socket.io',
  cors: {
    // 通过 Next 同源代理到 API，放宽为 true 以避免握手阶段 CORS 问题
    origin: true,
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 30000, // 简化配置
  pingInterval: 10000, // 简化配置
  maxHttpBufferSize: 1e5, // 简化配置
})
export class WebSocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebSocketGateway.name);

  // 连接管理
  private connectedUsers = new Map<string, AuthenticatedSocket>();
  private timelineSubscriptions = new Map<string, Set<string>>(); // repoId -> Set<socketId>
  private userConnections = new Map<string, Set<string>>(); // userId -> Set<socketId>

  // 学习项目配置（简化）
  private readonly MAX_CONNECTIONS_PER_USER = 5; // 放宽限制，便于学习测试

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly jwt: JwtService
  ) {}

  afterInit(_server: Server) {
    this.logger.log('WebSocket Gateway initialized');

    // 订阅快照状态更新
    this.subscribeToSnapshotStatusUpdates();

    this.logger.log('All Redis subscriptions initialized');
  }

  // ===== 聊天：房间与事件 =====

  /**
   * 加入聊天房间（仅成员）
   */
  @SubscribeMessage('join:chat')
  async handleJoinChat(
    @MessageBody() data: { chatId: string },
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    try {
      if (!client.userId) {
        client.emit('error', { message: '未认证' });
        return;
      }
      const cm = await (this.prisma as any).chatMember.findUnique({
        where: {
          chatId_userId: { chatId: data.chatId, userId: client.userId },
        } as any,
      });
      if (!cm) {
        client.emit('error', { message: '非会话成员，无法加入房间' });
        return;
      }
      await client.join(`chat:${data.chatId}`);
      client.emit('join:chat:success', { chatId: data.chatId });
    } catch (error) {
      this.logger.error('Failed to join chat room:', error);
      client.emit('error', { message: '加入聊天房间失败' });
    }
  }

  /**
   * 离开聊天房间
   */
  @SubscribeMessage('leave:chat')
  async handleLeaveChat(
    @MessageBody() data: { chatId: string },
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    try {
      await client.leave(`chat:${data.chatId}`);
      client.emit('leave:chat:success', { chatId: data.chatId });
    } catch (error) {
      this.logger.error('Failed to leave chat room:', error);
      client.emit('error', { message: '离开聊天房间失败' });
    }
  }

  /**
   * 推送新聊天消息
   */
  emitChatMessageNew(chatId: string, message: any) {
    this.server.to(`chat:${chatId}`).emit('chat:message:new', message);
  }

  /**
   * 推送聊天消息已读回执
   */
  emitChatMessageRead(
    chatId: string,
    userId: string,
    messageIds: string[],
    readAt: Date
  ) {
    this.server.to(`chat:${chatId}`).emit('chat:message:read', {
      chatId,
      userId,
      messageIds,
      readAt: readAt.toISOString(),
    });
  }

  /**
   * 推送新的好友申请（聊天室通知）
   */
  emitChatFriendRequestNew(userId: string, payload: any) {
    this.server.to(`user:${userId}`).emit('chat:friend-request:new', payload);
  }

  /**
   * 推送好友申请处理结果
   */
  emitChatFriendRequestResult(userId: string, payload: any) {
    this.server
      .to(`user:${userId}`)
      .emit('chat:friend-request:result', payload);
  }

  /**
   * 推送聊天室未读统计
   */
  emitChatUnreadCounts(userId: string, counts: any) {
    this.server.to(`user:${userId}`).emit('chat:unread-counts', counts);
  }

  /**
   * 推送私聊消息
   */
  emitPrivateMessage(toUserId: string, message: any) {
    this.server.to(`user:${toUserId}`).emit('private:message:new', message);
  }

  /**
   * 推送私聊消息已读回执
   */
  emitPrivateMessageRead(
    toUserId: string,
    fromUserId: string,
    messageIds: string[],
    readAt: Date
  ) {
    this.server.to(`user:${toUserId}`).emit('private:message:read', {
      fromUserId,
      messageIds,
      readAt: readAt.toISOString(),
    });
  }

  // 移除好友状态变化推送，避免打扰用户
  // emitFriendStatusChange(userId: string, statusPayload: any) {
  //   this.server.to(`user:${userId}`).emit('friend:status:change', statusPayload);
  // }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // 1) 从 Cookie 或 Authorization Bearer 提取 JWT（仅接受 JWT，不再接受明文 uid）
      const token = this.extractAccessToken(client);
      if (!token) {
        this.logger.warn(`Client ${client.id} connected without JWT`);
        client.emit('auth:error', { message: '缺少认证凭据' });
        client.disconnect();
        return;
      }

      // 2) 校验并解析 access token（要求 type=access）
      let decoded: any;
      try {
        decoded = await this.jwt.verifyAsync(token);
      } catch {
        this.logger.warn(`Client ${client.id} provided invalid JWT`);
        client.emit('auth:error', { message: '认证令牌无效或已过期' });
        client.disconnect();
        return;
      }

      if (!decoded?.sub || (decoded?.type && decoded.type !== 'access')) {
        this.logger.warn(`Client ${client.id} provided non-access token`);
        client.emit('auth:error', { message: '认证令牌类型错误' });
        client.disconnect();
        return;
      }

      const userId = String(decoded.sub);

      // 3) 回源确认用户状态
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          uid: true,
          role: true,
          isActive: true,
        },
      });

      if (!user?.isActive) {
        this.logger.warn(`Inactive or missing user for JWT sub=${userId}`);
        client.emit('auth:error', { message: '用户不存在或已被禁用' });
        client.disconnect();
        return;
      }

      // 4) 连接数限制
      if (
        this.getUserConnectionCount(user.id) >= this.MAX_CONNECTIONS_PER_USER
      ) {
        this.logger.warn(`User ${user.id} exceeded connection limit`);
        client.emit('auth:error', { message: '连接数超限，请关闭其他连接' });
        client.disconnect();
        return;
      }

      // 5) 注入会话信息
      client.userId = user.id;
      client.userRole = user.role;
      client.user = user;
      client.connectedAt = Date.now();

      // 6) 加入用户房间
      await client.join(`user:${user.id}`);

      // 7) 记录连接
      this.connectedUsers.set(client.id, client);
      if (!this.userConnections.has(user.id)) {
        this.userConnections.set(user.id, new Set());
      }
      this.userConnections.get(user.id)!.add(client.id);

      this.logger.log(
        `User ${user.username} (${user.id}) connected with socket ${client.id}`
      );

      // 8) 反馈成功
      client.emit('auth:success', {
        message: '连接成功',
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
      });
    } catch (error) {
      this.logger.error(
        `Authentication failed for client ${client.id}:`,
        error
      );
      client.emit('auth:error', { message: '认证失败' });
      client.disconnect();
    }
  }

  /**
   * 从握手中提取 access_token（Cookie 优先，后备 Authorization: Bearer）
   */
  private extractAccessToken(client: Socket): string | null {
    try {
      const cookieHeader = client.handshake.headers?.cookie as
        | string
        | undefined;
      const tokenFromCookie = this.getCookie('access_token', cookieHeader);
      if (tokenFromCookie) return tokenFromCookie;

      const auth = (client.handshake.headers?.authorization || '').toString();
      const m = /^Bearer\s+(.+)$/i.exec(auth);
      return m ? m[1] : null;
    } catch {
      return null;
    }
  }

  /** 简易 Cookie 解析器（避免引入外部依赖） */
  private getCookie(name: string, cookieHeader?: string): string | null {
    if (!cookieHeader) return null;
    const pairs = cookieHeader.split(';');
    for (const p of pairs) {
      const [k, ...v] = p.trim().split('=');
      if (!k) continue;
      if (k === name) {
        return decodeURIComponent(v.join('='));
      }
    }
    return null;
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.user) {
      this.logger.log(
        `User ${client.user.username} (${client.user.id}) disconnected`
      );

      // 清理用户连接记录
      const userConnections = this.userConnections.get(client.user.id);
      if (userConnections) {
        userConnections.delete(client.id);
        if (userConnections.size === 0) {
          this.userConnections.delete(client.user.id);
        }
      }
    } else {
      this.logger.log(`Client ${client.id} disconnected`);
    }

    // 清理时间线订阅
    this.cleanupTimelineSubscriptions(client.id);
    this.connectedUsers.delete(client.id);
  }

  /**
   * 加入仓库房间
   */
  @SubscribeMessage('join:repository')
  async handleJoinRepository(
    @MessageBody() data: { repositoryId: string },
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    if (!client.userId) {
      client.emit('error', { message: '未认证' });
      return;
    }

    try {
      // 验证用户是否有权限访问该仓库
      const repository = await this.prisma.repository.findUnique({
        where: { id: data.repositoryId },
      });

      if (!repository) {
        client.emit('error', { message: '仓库不存在' });
        return;
      }

      // 检查访问权限（PRIVATE 允许成员访问）
      let hasAccess =
        client.userRole === UserRole.ADMIN ||
        repository.ownerId === client.userId ||
        repository.visibility === 'PUBLIC' ||
        repository.visibility === 'INTERNAL';

      if (!hasAccess && repository.visibility === 'PRIVATE') {
        const isMember = await this.isRepoMember(repository.id, client.userId!);
        hasAccess = isMember;
      }

      if (!hasAccess) {
        client.emit('error', { message: '无权访问此仓库' });
        return;
      }

      // 加入仓库房间
      await client.join(`repository:${data.repositoryId}`);

      this.logger.log(
        `User ${client.user?.username} joined repository ${data.repositoryId}`
      );

      client.emit('join:repository:success', {
        repositoryId: data.repositoryId,
        message: '成功加入仓库房间',
      });
    } catch (error) {
      this.logger.error('Failed to join repository room:', error);
      client.emit('error', { message: '加入仓库房间失败' });
    }
  }

  /**
   * 离开仓库房间
   */
  @SubscribeMessage('leave:repository')
  async handleLeaveRepository(
    @MessageBody() data: { repositoryId: string },
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    await client.leave(`repository:${data.repositoryId}`);

    this.logger.log(
      `User ${client.user?.username} left repository ${data.repositoryId}`
    );

    client.emit('leave:repository:success', {
      repositoryId: data.repositoryId,
      message: '成功离开仓库房间',
    });
  }

  /**
   * 订阅时间线事件
   */
  @SubscribeMessage('subscribe:timeline')
  async handleSubscribeTimeline(
    @MessageBody()
    data: { repositoryId: string; eventTypes?: TimelineEventType[] },
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    if (!client.userId) {
      client.emit('error', { message: '未认证' });
      return;
    }

    try {
      // 验证仓库访问权限
      const hasAccess = await this.validateRepositoryAccess(
        data.repositoryId,
        client.userId,
        client.userRole!
      );

      if (!hasAccess) {
        client.emit('error', { message: '无权访问此仓库的时间线' });
        return;
      }

      // 添加到时间线订阅
      if (!this.timelineSubscriptions.has(data.repositoryId)) {
        this.timelineSubscriptions.set(data.repositoryId, new Set());
      }
      this.timelineSubscriptions.get(data.repositoryId)!.add(client.id);

      // 加入仓库房间（如果还没有加入）
      await client.join(`repository:${data.repositoryId}`);
      await client.join(`timeline:${data.repositoryId}`);

      this.logger.log(
        `User ${client.user?.username} subscribed to timeline for repository ${data.repositoryId}`
      );

      client.emit('subscribe:timeline:success', {
        repositoryId: data.repositoryId,
        eventTypes: data.eventTypes,
        message: '成功订阅时间线事件',
      });
    } catch (error) {
      this.logger.error('Failed to subscribe to timeline:', error);
      client.emit('error', { message: '订阅时间线事件失败' });
    }
  }

  /**
   * 取消订阅时间线事件
   */
  @SubscribeMessage('unsubscribe:timeline')
  async handleUnsubscribeTimeline(
    @MessageBody() data: { repositoryId: string },
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    // 从时间线订阅中移除
    const subscribers = this.timelineSubscriptions.get(data.repositoryId);
    if (subscribers) {
      subscribers.delete(client.id);
      if (subscribers.size === 0) {
        this.timelineSubscriptions.delete(data.repositoryId);
      }
    }

    // 离开时间线房间
    await client.leave(`timeline:${data.repositoryId}`);

    this.logger.log(
      `User ${client.user?.username} unsubscribed from timeline for repository ${data.repositoryId}`
    );

    client.emit('unsubscribe:timeline:success', {
      repositoryId: data.repositoryId,
      message: '成功取消订阅时间线事件',
    });
  }

  /**
   * 加入快照房间
   */
  @SubscribeMessage('join:snapshot')
  async handleJoinSnapshot(
    @MessageBody() data: { snapshotId: string },
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    this.logger.debug(
      `Received join:snapshot request for ${data.snapshotId} from user ${client.user?.username}`
    );

    if (!client.userId) {
      this.logger.warn(
        `Unauthenticated client tried to join snapshot ${data.snapshotId}`
      );
      client.emit('error', { message: '未认证' });
      return;
    }

    try {
      // 验证快照访问权限
      const snapshot = await this.prisma.snapshot.findUnique({
        where: { id: data.snapshotId },
        include: {
          repository: true,
        },
      });

      if (!snapshot) {
        this.logger.warn(`Snapshot ${data.snapshotId} not found`);
        client.emit('error', { message: '快照不存在' });
        return;
      }

      // 检查访问权限（PRIVATE 允许成员访问）
      let hasAccess =
        client.userRole === UserRole.ADMIN ||
        snapshot.ownerId === client.userId ||
        snapshot.repository.ownerId === client.userId ||
        snapshot.repository.visibility === 'PUBLIC' ||
        snapshot.repository.visibility === 'INTERNAL';

      if (!hasAccess && snapshot.repository.visibility === 'PRIVATE') {
        const isMember = await this.isRepoMember(
          snapshot.repository.id,
          client.userId!
        );
        hasAccess = isMember;
      }

      if (!hasAccess) {
        this.logger.warn(
          `User ${client.user?.username} denied access to snapshot ${data.snapshotId}`
        );
        client.emit('error', { message: '无权访问此快照' });
        return;
      }

      // 加入快照房间
      await client.join(`snapshot:${data.snapshotId}`);

      this.logger.log(
        `User ${client.user?.username} successfully joined snapshot room: snapshot:${data.snapshotId}`
      );

      client.emit('join:snapshot:success', {
        snapshotId: data.snapshotId,
        message: '成功加入快照房间',
      });
    } catch (error) {
      this.logger.error('Failed to join snapshot room:', error);
      client.emit('error', { message: '加入快照房间失败' });
    }
  }

  /**
   * 获取网关状态
   */
  @SubscribeMessage('gateway:status')
  handleGetGatewayStatus(@ConnectedSocket() client: AuthenticatedSocket) {
    client.emit('gateway:status', {
      activeConnections: this.connectedUsers.size,
      totalConnections: this.connectedUsers.size,
      message: '网关状态正常',
    });
  }

  /**
   * 心跳检测
   */
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: AuthenticatedSocket) {
    client.emit('pong', { timestamp: Date.now() });
  }

  /**
   * 测试快照状态更新（仅用于调试）
   */
  @SubscribeMessage('test:snapshot-status')
  handleTestSnapshotStatus(
    @MessageBody() data: { snapshotId: string; status: string },
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    if (client.userRole !== UserRole.ADMIN) {
      client.emit('error', { message: '仅管理员可以使用此测试功能' });
      return;
    }

    this.logger.log(
      `Testing snapshot status update for ${data.snapshotId}: ${data.status}`
    );

    // 直接触发快照状态变更事件
    this.emitSnapshotStatusChanged(data.snapshotId, {
      snapshotId: data.snapshotId,
      status: data.status,
      timestamp: new Date().toISOString(),
    });

    client.emit('test:snapshot-status:success', {
      message: `测试快照状态更新已发送: ${data.snapshotId} -> ${data.status}`,
    });
  }

  // ===== 事件推送方法 =====

  /**
   * 推送时间线事件
   */
  async emitTimelineEvent(
    repositoryId: string,
    event: any,
    _options?: {
      immediate?: boolean;
      eventTypes?: TimelineEventType[];
    }
  ) {
    try {
      // 验证事件数据
      if (!event || !repositoryId) {
        this.logger.warn('Invalid timeline event data');
        return;
      }

      // 添加时间戳和元数据
      const enrichedEvent = {
        ...event,
        timestamp: new Date().toISOString(),
        repositoryId,
        eventId: `${event.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

      // 发送到时间线房间
      this.server
        .to(`timeline:${repositoryId}`)
        .emit('timeline:new-event', enrichedEvent);

      // 同时发送到仓库房间（向后兼容）
      this.server
        .to(`repository:${repositoryId}`)
        .emit('timeline:new-event', enrichedEvent);

      this.logger.debug(`Timeline event sent to repository ${repositoryId}`);
    } catch (error) {
      this.logger.error('Failed to emit timeline event:', error);
    }
  }

  /**
   * 推送快照状态变更
   */
  emitSnapshotStatusChanged(snapshotId: string, data: any) {
    const roomName = `snapshot:${snapshotId}`;
    const clientsInRoom = this.server.sockets.adapter.rooms.get(roomName);
    const clientCount = clientsInRoom ? clientsInRoom.size : 0;

    this.server.to(roomName).emit('snapshot:status-changed', data);

    this.logger.log(
      `Snapshot status change emitted to room ${roomName} (${clientCount} clients): ${JSON.stringify(data)}`
    );
  }

  /**
   * 推送新评论
   */
  emitNewComment(snapshotId: string, comment: any) {
    this.server.to(`snapshot:${snapshotId}`).emit('comment:new', comment);

    this.logger.debug(`New comment emitted to snapshot ${snapshotId}`);
  }

  /**
   * 推送评论更新
   */
  emitCommentUpdated(snapshotId: string, comment: any) {
    this.server.to(`snapshot:${snapshotId}`).emit('comment:updated', comment);

    this.logger.debug(`Comment update emitted to snapshot ${snapshotId}`);
  }

  /**
   * 推送评论解决
   */
  emitCommentResolved(snapshotId: string, comment: any) {
    this.server.to(`snapshot:${snapshotId}`).emit('comment:resolved', comment);

    this.logger.debug(`Comment resolved emitted to snapshot ${snapshotId}`);
  }
  /**
   * 推送评论删除
   */
  emitCommentDeleted(snapshotId: string, data: any) {
    this.server.to(`snapshot:${snapshotId}`).emit('comment:deleted', data);
    this.logger.debug(`Comment deleted emitted to snapshot ${snapshotId}`);
  }

  /**
   * 推送仓库更新
   */
  emitRepositoryUpdated(repositoryId: string, repository: any) {
    this.server
      .to(`repository:${repositoryId}`)
      .emit('repository:updated', repository);

    this.logger.debug(
      `Repository update emitted to repository ${repositoryId}`
    );
  }

  /**
   * 向特定用户推送通知
   */
  emitUserNotification(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notification', notification);

    this.logger.debug(`Notification emitted to user ${userId}`);
  }

  /**
   * 订阅快照状态更新
   */
  private async subscribeToSnapshotStatusUpdates() {
    try {
      // 使用模式订阅所有快照状态更新
      await this.redis.psubscribe('snapshot:status:*', (channel, message) => {
        try {
          const statusUpdate = JSON.parse(message);

          // 兼容Worker发布的消息格式（小写字段名）
          const snapshotId = statusUpdate.id || statusUpdate.ID;
          const status = statusUpdate.status || statusUpdate.Status;

          if (snapshotId && status) {
            // 推送快照状态变更到对应房间
            this.emitSnapshotStatusChanged(snapshotId, {
              snapshotId,
              status,
              timestamp: new Date().toISOString(),
            });

            this.logger.debug(
              `Snapshot status update emitted for ${snapshotId}: ${status} (channel: ${channel})`
            );
          } else {
            this.logger.warn(
              `Invalid snapshot status update format: ${JSON.stringify(statusUpdate)}`
            );
          }
        } catch (error) {
          this.logger.error('Failed to parse snapshot status update:', error);
          this.logger.error('Raw message:', message);
        }
      });

      this.logger.log('Subscribed to snapshot status updates');
    } catch (error) {
      this.logger.error(
        'Failed to subscribe to snapshot status updates:',
        error
      );
    }
  }

  // ===== 私有辅助方法 =====

  /**
   * 验证仓库访问权限
   */
  private async validateRepositoryAccess(
    repositoryId: string,
    userId: string,
    userRole: UserRole
  ): Promise<boolean> {
    try {
      const repo = await this.prisma.repository.findUnique({
        where: { id: repositoryId },
        select: { id: true, ownerId: true, visibility: true },
      });
      if (!repo) return false;
      const { canReadRepo } = await import('../auth/utils/access');
      return await canReadRepo(
        this.prisma as any,
        repo as any,
        userId,
        userRole
      );
    } catch (error) {
      this.logger.error('Failed to validate repository access:', error);
      return false;
    }
  }

  /** 成员判断：用于 PRIVATE 访问许可 */
  private async isRepoMember(repoId: string, userId: string) {
    const member = await this.prisma.member.findUnique({
      where: { repoId_userId: { repoId, userId } } as any,
    });
    return !!member;
  }

  /**
   * 清理时间线订阅
   */
  private cleanupTimelineSubscriptions(socketId: string) {
    for (const [repositoryId, subscribers] of this.timelineSubscriptions) {
      subscribers.delete(socketId);
      if (subscribers.size === 0) {
        this.timelineSubscriptions.delete(repositoryId);
      }
    }
  }

  /**
   * 获取用户连接数
   */
  private getUserConnectionCount(userId: string): number {
    const connections = this.userConnections.get(userId);
    return connections ? connections.size : 0;
  }

  // ===== 健康检查和监控方法 =====

  /**
   * 获取网关状态（学习项目版本：简化实现）
   */
  getGatewayStatus() {
    const totalConnections = this.connectedUsers.size;
    const activeConnections = Array.from(this.connectedUsers.values()).filter(
      client => client.connected
    ).length;

    // 按用户统计连接数
    const byUser: Record<string, number> = {};
    for (const [userId, connections] of this.userConnections) {
      byUser[userId] = connections.size;
    }

    return {
      totalConnections,
      activeConnections,
      totalEventsSent: 0, // 学习项目版本：简化统计
      avgEventLatency: 0, // 学习项目版本：简化统计
      cacheHitRate: 0, // 学习项目版本：简化统计
      slowEventRate: 0, // 学习项目版本：简化统计
      uptime: process.uptime() * 1000, // 转换为毫秒
      errorCount: 0, // 学习项目版本：简化统计
      eventStats: {
        total: 0,
        byType: {},
        byRepository: {},
        avgLatency: 0,
      },
      connections: {
        total: totalConnections,
        active: activeConnections,
        byUser,
      },
    };
  }

  /**
   * 重置性能指标（学习项目版本：简化实现）
   */
  resetPerformanceMetrics() {
    this.logger.log('Performance metrics reset (learning project version)');
    // 学习项目版本：简化实现，实际项目中会有更复杂的指标重置逻辑
  }
}
