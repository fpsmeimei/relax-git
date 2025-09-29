import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { v4 as uuidv4 } from 'uuid';

/**
 * 时间线模块专用异常过滤器
 * 提供统一的错误响应格式和详细的错误日志
 */
@Catch()
export class TimelineExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(TimelineExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();
    const traceId = uuidv4();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'INTERNAL_SERVER_ERROR';
    let details: any = undefined;

    // 处理HTTP异常
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || responseObj.error || message;
        error = responseObj.error || this.getErrorTypeFromStatus(status);
        details = responseObj.details || responseObj.message;
      }
    } else if (exception instanceof Error) {
      // 处理普通错误
      message = exception.message;
      this.logger.error(
        `Unhandled error: ${exception.message}`,
        exception.stack
      );
    } else {
      // 处理未知错误
      this.logger.error(`Unknown exception:`, exception);
    }

    // 构建错误响应
    const errorResponse = this.buildErrorResponse(
      status,
      message,
      error,
      request.url,
      traceId,
      details
    );

    // 记录错误日志
    this.logError(request, status, message, traceId, exception);

    response.status(status).send(JSON.stringify(errorResponse));
  }

  /**
   * 构建标准错误响应
   */
  private buildErrorResponse(
    statusCode: number,
    message: string,
    error: string,
    path: string,
    traceId: string,
    details?: any
  ) {
    const baseResponse = {
      statusCode,
      message,
      error,
      timestamp: new Date().toISOString(),
      path,
      traceId,
    };

    // 根据错误类型添加特定字段
    switch (statusCode) {
      case HttpStatus.BAD_REQUEST:
        return {
          ...baseResponse,
          details: Array.isArray(details) ? details : [details].filter(Boolean),
        };

      case HttpStatus.FORBIDDEN:
        return {
          ...baseResponse,
          code: 'INSUFFICIENT_PERMISSIONS',
          requiredPermission: this.extractRequiredPermission(message),
        };

      case HttpStatus.NOT_FOUND:
        return {
          ...baseResponse,
          resourceType: this.extractResourceType(message),
          resourceId: this.extractResourceId(path),
        };

      case HttpStatus.REQUEST_TIMEOUT:
        return {
          ...baseResponse,
          timeout: 30000,
          suggestions: [
            '减少查询时间范围',
            '使用更具体的过滤条件',
            '考虑使用分页查询',
          ],
        };

      case HttpStatus.INTERNAL_SERVER_ERROR:
        return {
          ...baseResponse,
          isKnownError: this.isKnownError(message),
        };

      default:
        return baseResponse;
    }
  }

  /**
   * 记录错误日志
   */
  private logError(
    request: FastifyRequest,
    status: number,
    message: string,
    traceId: string,
    exception: unknown
  ) {
    const logContext = {
      traceId,
      method: request.method,
      url: request.url,
      userAgent: request.headers?.['user-agent'] || 'Unknown',
      ip: request.ip,
      userId: (request as any).user?.id,
      status,
      message,
    };

    if (status >= 500) {
      this.logger.error(`Server Error [${traceId}]`, {
        ...logContext,
        stack: exception instanceof Error ? exception.stack : undefined,
      });
    } else if (status >= 400) {
      this.logger.warn(`Client Error [${traceId}]`, logContext);
    } else {
      this.logger.log(`Request [${traceId}]`, logContext);
    }
  }

  /**
   * 根据状态码获取错误类型
   */
  private getErrorTypeFromStatus(status: number): string {
    const errorTypes: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
      [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
      [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
      [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
      [HttpStatus.METHOD_NOT_ALLOWED]: 'METHOD_NOT_ALLOWED',
      [HttpStatus.REQUEST_TIMEOUT]: 'REQUEST_TIMEOUT',
      [HttpStatus.CONFLICT]: 'CONFLICT',
      [HttpStatus.UNPROCESSABLE_ENTITY]: 'UNPROCESSABLE_ENTITY',
      [HttpStatus.TOO_MANY_REQUESTS]: 'TOO_MANY_REQUESTS',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'INTERNAL_SERVER_ERROR',
      [HttpStatus.BAD_GATEWAY]: 'BAD_GATEWAY',
      [HttpStatus.SERVICE_UNAVAILABLE]: 'SERVICE_UNAVAILABLE',
      [HttpStatus.GATEWAY_TIMEOUT]: 'GATEWAY_TIMEOUT',
    };

    return errorTypes[status] || 'UNKNOWN_ERROR';
  }

  /**
   * 提取所需权限信息
   */
  private extractRequiredPermission(message: string): string | undefined {
    if (message.includes('仓库')) return 'REPOSITORY_READ';
    if (message.includes('管理员')) return 'ADMIN_ACCESS';
    if (message.includes('统计')) return 'STATS_READ';
    return undefined;
  }

  /**
   * 提取资源类型
   */
  private extractResourceType(message: string): string {
    if (message.includes('仓库')) return 'Repository';
    if (message.includes('快照')) return 'Snapshot';
    if (message.includes('评论')) return 'Comment';
    if (message.includes('用户')) return 'User';
    return 'Resource';
  }

  /**
   * 从路径提取资源ID
   */
  private extractResourceId(path: string): string | undefined {
    const matches = path.match(/\/([a-f0-9-]{36}|\w+)(?:\/|$)/);
    return matches ? matches[1] : undefined;
  }

  /**
   * 判断是否为已知错误
   */
  private isKnownError(message: string): boolean {
    const knownErrorPatterns = [
      '查询时间线事件失败',
      '获取时间线统计失败',
      '获取聚合时间线数据失败',
      '获取热力图数据失败',
      '仓库不存在',
      '权限不足',
    ];

    return knownErrorPatterns.some(pattern => message.includes(pattern));
  }
}
