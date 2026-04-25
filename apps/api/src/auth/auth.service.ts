import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRole } from '@relax-git/shared/generated/prisma-client';
import * as bcrypt from 'bcrypt';
import {
  AuditAction,
  AuditLogService,
  AuditResult,
} from '../common/services/audit-log.service';
import { PrismaService } from '../database/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { AccountSecurityService } from './services/account-security.service';

// Type definitions
export interface UserPayload {
  id: string;
  username: string;
  uid: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
}

/**
 * Authentication Service
 * 基于 UID 的简化认证服务，无 token 生成与管理
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accountSecurity: AccountSecurityService,
    private readonly auditLog: AuditLogService
  ) {}

  /**
   * User registration
   */
  async register(registerDto: RegisterDto, ipAddress?: string) {
    const { username, password } = registerDto;

    const existingUser = await this.prisma.user.findFirst({
      where: {
        username,
      },
    });

    if (existingUser) {
      throw new ConflictException('该用户已注册');
    }

    // Password hashing
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const uid = await this.generateUid(username);
    const user = await this.prisma.user.create({
      data: {
        username,
        uid,
        password: hashedPassword,
        role: UserRole.USER,
      },
    });

    // 自动添加 relax-git-bot 为好友
    try {
      await this.addBotAsFriend(user.id);
    } catch (error) {
      console.error('Failed to add bot as friend:', error);
      // 不影响注册流程
    }

    // Log registration
    await this.auditLog.log({
      action: AuditAction.REGISTER,
      result: AuditResult.SUCCESS,
      userId: user.id,
      ...(ipAddress && { ipAddress }),
      details: { username },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
    };
  }

  /**
   * 为新用户自动添加机器人好友
   */
  private async addBotAsFriend(userId: string) {
    const bot = await this.prisma.user.findUnique({
      where: { username: 'relax-git-bot' },
    });
    if (!bot) return;

    // 创建双向好友关系
    await this.prisma.friendship.createMany({
      data: [
        { userId, friendId: bot.id },
        { userId: bot.id, friendId: userId },
      ],
      skipDuplicates: true,
    });

    // 创建 Chat
    const [x, y] = [userId, bot.id].sort();
    const directKey = `${x}:${y}`;
    const chat = await this.prisma.chat.create({
      data: {
        type: 'DIRECT',
        directKey,
        members: {
          createMany: {
            data: [
              { userId, role: 'MEMBER' },
              { userId: bot.id, role: 'MEMBER' },
            ],
          },
        },
      },
    });

    // 发送欢迎消息
    await this.prisma.message.create({
      data: {
        chatId: chat.id,
        senderId: bot.id,
        content:
          '你好，我是 Relax-Git 助手机器人。\n可以点击下面的输入框和我打个招呼，体验一下消息中心里的私信流程。',
        type: 'TEXT',
        isRead: false,
      },
    });
  }

  /**
   * 生成唯一 uid（与 UsersService 一致的策略）
   */
  private async generateUid(base: string): Promise<string> {
    const slugBase =
      (base || 'user')
        .toLowerCase()
        .replace(/[^a-z0-9_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 40) || 'user';
    let candidate = slugBase;
    let i = 1;
    while (await this.prisma.user.findUnique({ where: { uid: candidate } })) {
      i += 1;
      candidate = `${slugBase}-${i}`.slice(0, 48);
    }
    return candidate;
  }

  /**
   * User login
   */
  async login(loginDto: LoginDto, ipAddress?: string) {
    const { username, password } = loginDto;

    // Check account security
    await this.accountSecurity.checkAccountSecurity(username);

    // Validate user
    const user = await this.validateUser(username, password);
    if (!user) {
      await this.accountSecurity.recordFailedAttempt(username, ipAddress);
      throw new UnauthorizedException('用户名或密码错误');
    }

    // Reset failed attempts on successful login
    this.accountSecurity.resetFailedAttempts(username).catch(error => {
      console.warn('Failed to reset failed attempts:', error);
    });

    // Log login
    await this.auditLog.log({
      action: AuditAction.LOGIN,
      result: AuditResult.SUCCESS,
      userId: user.id,
      ...(ipAddress && { ipAddress }),
      details: { username },
    });

    return {
      user,
    };
  }

  /**
   * Validate user credentials
   */
  async validateUser(
    username: string,
    password: string
  ): Promise<UserPayload | null> {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (
      user &&
      user.isActive &&
      (await bcrypt.compare(password, user.password))
    ) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...result } = user;
      return result as UserPayload;
    }
    return null;
  }

  /**
   * 根据ID查找用户
   */
  async findUserById(userId: string) {
    return await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        role: true,
        isActive: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
