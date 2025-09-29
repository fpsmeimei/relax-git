import { ApiProperty } from '@nestjs/swagger';

/**
 * 标准错误响应DTO
 */
export class ErrorResponseDto {
  @ApiProperty({
    description: 'HTTP状态码',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: '错误消息',
    example: '参数验证失败',
  })
  message: string;

  @ApiProperty({
    description: '错误类型',
    example: 'BAD_REQUEST',
  })
  error: string;

  @ApiProperty({
    description: '请求时间戳',
    example: '2024-01-15T10:30:00.000Z',
  })
  timestamp: string;

  @ApiProperty({
    description: '请求路径',
    example: '/api/timeline/events',
  })
  path: string;
}

/**
 * 验证错误响应DTO
 */
export class ValidationErrorResponseDto extends ErrorResponseDto {
  @ApiProperty({
    description: '详细验证错误信息',
    type: [String],
    example: [
      'page must be a positive number',
      'limit must not be greater than 100',
    ],
  })
  details: string[];
}

/**
 * 权限错误响应DTO
 */
export class ForbiddenErrorResponseDto extends ErrorResponseDto {
  @ApiProperty({
    description: '权限错误代码',
    example: 'INSUFFICIENT_PERMISSIONS',
  })
  code: string;

  @ApiProperty({
    description: '所需权限',
    example: 'REPOSITORY_READ',
  })
  requiredPermission?: string;
}

/**
 * 资源未找到错误响应DTO
 */
export class NotFoundErrorResponseDto extends ErrorResponseDto {
  @ApiProperty({
    description: '资源类型',
    example: 'Repository',
  })
  resourceType: string;

  @ApiProperty({
    description: '资源ID',
    example: 'clm1234567890abcdef',
  })
  resourceId?: string;
}

/**
 * 服务器错误响应DTO
 */
export class InternalServerErrorResponseDto extends ErrorResponseDto {
  @ApiProperty({
    description: '错误追踪ID',
    example: 'err_clm1234567890abcdef',
  })
  traceId: string;

  @ApiProperty({
    description: '是否为已知错误',
    example: false,
  })
  isKnownError: boolean;
}

/**
 * 性能相关错误响应DTO
 */
export class PerformanceErrorResponseDto extends ErrorResponseDto {
  @ApiProperty({
    description: '查询超时时间(ms)',
    example: 30000,
  })
  timeout: number;

  @ApiProperty({
    description: '建议的优化措施',
    type: [String],
    example: ['减少查询时间范围', '使用更具体的过滤条件', '考虑使用分页查询'],
  })
  suggestions: string[];
}

/**
 * 缓存相关错误响应DTO
 */
export class CacheErrorResponseDto extends ErrorResponseDto {
  @ApiProperty({
    description: '缓存键',
    example: 'timeline:events:user123:page1',
  })
  cacheKey: string;

  @ApiProperty({
    description: '缓存操作类型',
    example: 'GET',
    enum: ['GET', 'SET', 'DELETE'],
  })
  operation: 'GET' | 'SET' | 'DELETE';

  @ApiProperty({
    description: '是否降级到数据库查询',
    example: true,
  })
  fallbackToDatabase: boolean;
}
