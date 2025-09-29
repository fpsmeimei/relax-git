// 验证工具函数

import { z } from 'zod';

// 通用验证 schema
export const emailSchema = z.string().email('无效的邮箱格式');
export const passwordSchema = z
  .string()
  .min(8, '密码至少8位')
  .max(128, '密码最多128位');
export const usernameSchema = z
  .string()
  .min(3, '用户名至少3位')
  .max(50, '用户名最多50位')
  .regex(/^[a-zA-Z0-9_-]+$/, '用户名只能包含字母、数字、下划线和连字符');

// Git 相关验证
export const gitUrlSchema = z
  .string()
  .url('无效的Git URL')
  .refine(
    url =>
      url.includes('.git') ||
      url.includes('github.com') ||
      url.includes('gitlab.com'),
    '必须是有效的Git仓库URL'
  );

export const commitShaSchema = z
  .string()
  .regex(/^[a-f0-9]{40}$/, '无效的commit SHA');
export const branchNameSchema = z
  .string()
  .min(1, '分支名不能为空')
  .max(255, '分支名过长');

// 文件路径验证
export const filePathSchema = z
  .string()
  .min(1, '文件路径不能为空')
  .refine(
    path => !path.includes('..') && !path.startsWith('/'),
    '文件路径不能包含相对路径或绝对路径'
  );

// 分页验证
export const paginationSchema = z.object({
  page: z.number().int().min(1, '页码必须大于0').default(1),
  limit: z
    .number()
    .int()
    .min(1, '每页数量必须大于0')
    .max(100, '每页数量不能超过100')
    .default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// 验证工具函数
export const validateEmail = (email: string): boolean => {
  return emailSchema.safeParse(email).success;
};

export const validatePassword = (password: string): boolean => {
  return passwordSchema.safeParse(password).success;
};

export const validateGitUrl = (url: string): boolean => {
  return gitUrlSchema.safeParse(url).success;
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};
