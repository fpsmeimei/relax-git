import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@relax-git/shared/generated/prisma-client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../database/prisma.service';
import { CreateUserDto, QueryUsersDto, UpdateUserDto } from './dto/users.dto';

/**
 * 用户服务
 * 处理用户相关的业务逻辑
 */
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建用户（管理员功能）
   */
  async create(createUserDto: CreateUserDto) {
    const { email, username, password, role, avatar } = createUserDto;

    // 检查用户是否已存在
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      throw new ConflictException('用户邮箱或用户名已存在');
    }

    // 密码哈希
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 生成不可变 uid（基于 username 的 slug + 去重）
    const uid = await this.generateUid(username);

    // 创建用户
    const user = await this.prisma.user.create({
      data: {
        email,
        username,
        uid,
        password: hashedPassword,
        role: role ?? UserRole.USER,
        avatar: avatar ?? null,
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * 生成唯一 uid（不可变）
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
    // prisma findUnique 只能查唯一字段
    while (await this.prisma.user.findUnique({ where: { uid: candidate } })) {
      i += 1;
      candidate = `${slugBase}-${i}`.slice(0, 48);
    }
    return candidate;
  }

  /**
   * 查询用户列表
   */
  async findAll(queryDto: QueryUsersDto) {
    const { page = 1, limit = 10, search, role, isActive } = queryDto;
    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (typeof isActive === 'boolean') {
      where.isActive = isActive;
    }

    // 执行查询
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          avatar: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              ownedRepositories: true,
              comments: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 根据 ID 获取用户详情
   */
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        uid: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            ownedRepositories: true,
            comments: true,
            timelineEvents: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return user;
  }

  /**
   * 更新用户信息
   */
  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    currentUserId: string,
    currentUserRole: UserRole
  ) {
    // 检查用户是否存在
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('用户不存在');
    }

    // 权限检查：只有管理员或用户本人可以更新
    if (currentUserId !== id && currentUserRole !== UserRole.ADMIN) {
      throw new ForbiddenException('权限不足，无法更新此用户信息');
    }

    const { email, username, password, role, avatar, isActive } = updateUserDto;

    // 检查邮箱和用户名是否冲突
    if (email || username) {
      const conflictUser = await this.prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [email ? { email } : {}, username ? { username } : {}].filter(
                condition => Object.keys(condition).length > 0
              ),
            },
          ],
        },
      });

      if (conflictUser) {
        throw new ConflictException('邮箱或用户名已被其他用户使用');
      }
    }

    // 构建更新数据（禁止修改 uid）
    const updateData: any = {};

    if (email) updateData.email = email;
    if (username) updateData.username = username;
    if (avatar !== undefined) updateData.avatar = avatar;

    // 密码更新
    if (password) {
      const saltRounds = 12;
      updateData.password = await bcrypt.hash(password, saltRounds);
    }

    // 只有管理员可以更新角色和状态
    if (currentUserRole === UserRole.ADMIN) {
      if (role) updateData.role = role;
      if (typeof isActive === 'boolean') updateData.isActive = isActive;
    }

    // 更新用户
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        uid: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  /**
   * 更新头像 URL
   */
  async updateAvatar(id: string, avatarUrl: string) {
    const updated = await this.prisma.user.update({
      where: { id },
      data: { avatar: avatarUrl },
      select: {
        id: true,
        email: true,
        username: true,
        uid: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return updated;
  }

  /**
   * 删除用户（软删除）
   */
  async remove(id: string, currentUserRole: UserRole) {
    // 只有管理员可以删除用户
    if (currentUserRole !== UserRole.ADMIN) {
      throw new ForbiddenException('权限不足，无法删除用户');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 软删除：将用户设为非活跃状态
    const deletedUser = await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return deletedUser;
  }

  /**
   * 获取用户统计信息
   */
  async getStats() {
    const [totalUsers, activeUsers, adminUsers, usersByRole] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.user.count({ where: { isActive: true } }),
        this.prisma.user.count({ where: { role: UserRole.ADMIN } }),
        this.prisma.user.groupBy({
          by: ['role'],
          _count: { role: true },
        }),
      ]);

    return {
      total: totalUsers,
      active: activeUsers,
      admins: adminUsers,
      byRole: usersByRole.reduce(
        (acc: Record<string, number>, item: any) => {
          acc[item.role] = item._count.role;
          return acc;
        },
        {} as Record<string, number>
      ),
      timestamp: new Date().toISOString(),
    };
  }
}
