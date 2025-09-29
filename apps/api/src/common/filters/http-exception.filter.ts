import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<any>();
    const reply = ctx.getResponse<any>();

    const timestamp = new Date().toISOString();
    const path = request?.url ?? '';

    // Default values
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = '内部服务器错误';
    let details: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse() as any;

      // Nest 标准：string | { message, error, statusCode } | 自定义对象
      if (typeof res === 'string') {
        message = res;
      } else if (res && typeof res === 'object') {
        // 优先保留业务抛出的 code/message（例如 Guard/Service 自定义）
        if (res.code) code = String(res.code);
        if (res.message)
          message = Array.isArray(res.message)
            ? res.message.join(', ')
            : String(res.message);
        // ValidationPipe: { statusCode, message: string[] , error: 'Bad Request' }
        if (!res.code && status === HttpStatus.BAD_REQUEST) {
          code = 'VALIDATION_ERROR';
          if (Array.isArray(res.message)) details = res.message;
        }
        // 从标准 error 字段推断更友好的 message（兜底）
        if (!res.message && res.error) message = String(res.error);
      }

      // 基于状态码的默认 code（当上面未设置时）
      if (!resHasCode(code)) {
        code = mapStatusToCode(status);
      }
    } else {
      // 未知错误兜底
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      code = 'INTERNAL_ERROR';
      message = (exception as any)?.message ?? message;
    }

    const payload: any = {
      success: false,
      code,
      message,
      status,
      path,
      timestamp,
    };
    if (details) payload.details = details;

    // Fastify reply
    try {
      reply.status(status).send(payload);
    } catch {
      // Fallback in case reply is not available
      // eslint-disable-next-line no-console
      console.error('HttpExceptionFilter fallback:', payload);
    }
  }
}

function mapStatusToCode(status: number): string {
  switch (status) {
    case HttpStatus.BAD_REQUEST:
      return 'BAD_REQUEST';
    case HttpStatus.UNAUTHORIZED:
      return 'UNAUTHORIZED';
    case HttpStatus.FORBIDDEN:
      return 'FORBIDDEN';
    case HttpStatus.NOT_FOUND:
      return 'NOT_FOUND';
    case HttpStatus.CONFLICT:
      return 'CONFLICT';
    case HttpStatus.TOO_MANY_REQUESTS:
      return 'RATE_LIMITED';
    default:
      return 'INTERNAL_ERROR';
  }
}

function resHasCode(code: string | undefined): boolean {
  return typeof code === 'string' && code.length > 0;
}
