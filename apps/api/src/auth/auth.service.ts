import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@relax-git/shared/generated/prisma-client';
import * as bcrypt from 'bcrypt';
import {
  AuditAction,
  AuditLogService,
  AuditResult,
} from '../common/services/audit-log.service';
import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../redis/redis.service';
import { LoginDto, RefreshTokenDto, RegisterDto } from './dto/auth.dto';
import { AccountSecurityService } from './services/account-security.service';
import { TokenBlacklistService } from './services/token-blacklist.service';

// Type definitions
export interface UserPayload {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
}

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  jti?: string;
  iat?: number;
  exp?: number;
}

/**
 * Authentication Service
 * 应届生学习项目版本：简化认证服务，重点学习JWT和用户管理基础
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly tokenBlacklist: TokenBlacklistService,
    private readonly accountSecurity: AccountSecurityService,
    private readonly auditLog: AuditLogService
  ) {}

  /**
   * User registration
   */
  async register(registerDto: RegisterDto, ipAddress?: string) {
    console.log('AuthService.register called with:', {
      username: registerDto.username,
      ipAddress,
    });
    const { username, password } = registerDto;

    // Check if username already exists
    console.log('Checking if username exists:', username);
    const existingUser = await this.prisma.user.findFirst({
      where: {
        username,
      },
    });
    console.log(
      'Existing user check result:',
      existingUser ? 'User exists' : 'User does not exist'
    );

    if (existingUser) {
      throw new ConflictException('该用户已注册');
    }

    // Password hashing
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user with generated email
    console.log('Generating email and uid for user:', username);
    const generatedEmail = `${username}@relax-git.local`;
    const uid = await this.generateUid(username);
    console.log('Generated uid:', uid);
    console.log('Creating user in database...');
    const user = await this.prisma.user.create({
      data: {
        email: generatedEmail,
        username,
        uid,
        password: hashedPassword,
        role: UserRole.USER,
      },
    });
    console.log('User created successfully:', user.id);

    // Log registration
    await this.auditLog.log({
      action: AuditAction.REGISTER,
      result: AuditResult.SUCCESS,
      userId: user.id,
      ...(ipAddress && { ipAddress }),
      details: { username },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user as UserPayload);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      ...tokens,
    };
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
      // Log error but don't fail login
      console.warn('Failed to reset failed attempts:', error);
    });

    // Generate tokens
    const tokens = await this.generateTokens(user);

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
      ...tokens,
    };
  }

  /**
   * Refresh token
   */
  async refreshToken(refreshTokenDto: RefreshTokenDto, ipAddress?: string) {
    const { refreshToken } = refreshTokenDto;

    try {
      // Verify refresh token
      const rawPayload = this.jwtService.verify(refreshToken, {
        secret:
          this.configService.get<string>('JWT_REFRESH_SECRET') ??
          'refresh-secret',
      });

      if (
        typeof rawPayload !== 'object' ||
        !rawPayload ||
        !('sub' in rawPayload)
      ) {
        throw new UnauthorizedException('Invalid refresh token payload');
      }

      const jwtPayload = rawPayload as JwtPayload;

      // Check if token is blacklisted
      const isBlacklisted =
        await this.tokenBlacklist.isTokenBlacklisted(refreshToken);
      if (isBlacklisted) {
        throw new UnauthorizedException('Token has been revoked');
      }

      // Get user
      const user = await this.prisma.user.findUnique({
        where: { id: jwtPayload.sub },
      });

      if (!user?.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      // Generate new tokens
      const tokens = await this.generateTokens({
        ...user,
        avatar: user.avatar || '',
      });

      // Blacklist old refresh token
      await this.tokenBlacklist.blacklistToken(refreshToken, 'Token refreshed');

      // Log token refresh
      await this.auditLog.log({
        action: AuditAction.TOKEN_REFRESH,
        result: AuditResult.SUCCESS,
        userId: user.id,
        ...(ipAddress && { ipAddress }),
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        ...tokens,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * User logout
   */
  async logout(userId: string, ipAddress?: string) {
    // Revoke all user tokens
    await this.tokenBlacklist.revokeAllUserTokens(userId, 'User logout');

    // Log logout
    await this.auditLog.log({
      action: AuditAction.LOGOUT,
      result: AuditResult.SUCCESS,
      userId,
      ...(ipAddress && { ipAddress }),
    });

    return { message: 'Logged out successfully' };
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
   * Generate access and refresh tokens
   */
  private async generateTokens(user: UserPayload) {
    const now = Math.floor(Date.now() / 1000);
    const jti = `${user.id}_${now}_${Math.random().toString(36).substr(2, 9)}`;

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      jti, // JWT ID for token tracking
      iat: now,
    };

    const refreshPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      jti: `refresh_${jti}`,
      iat: now,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') ?? '24h',
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret:
          this.configService.get<string>('JWT_REFRESH_SECRET') ??
          'refresh-secret',
        expiresIn:
          this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') ?? '24h',
    };
  }

  /**
   * Store user session
   */
  private async storeUserSession(userId: string, refreshToken: string) {
    const sessionData = {
      refreshToken,
      createdAt: new Date().toISOString(),
    };

    // Set session expiration time (7 days)
    const ttl = 7 * 24 * 60 * 60; // 7 days in seconds
    await this.redis.set(
      `user:session:${userId}`,
      JSON.stringify(sessionData),
      ttl
    );
  }

  /**
   * 根据ID查找用户
   */
  async findUserById(userId: string) {
    return await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
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
