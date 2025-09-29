import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  Logger,
  PipeTransform,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

/**
 * 时间线模块专用验证管道
 * 提供详细的验证错误信息和性能优化
 */
@Injectable()
export class TimelineValidationPipe implements PipeTransform<any> {
  private readonly logger = new Logger(TimelineValidationPipe.name);

  async transform(value: any, { metatype }: ArgumentMetadata) {
    // 跳过基础类型和没有元类型的情况
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const startTime = Date.now();

    try {
      // 转换为类实例
      const object = plainToClass(metatype, value);

      // 执行验证
      const errors = await validate(object, {
        whitelist: true, // 只保留装饰器标记的属性
        forbidNonWhitelisted: true, // 禁止未知属性
        transform: true, // 自动类型转换
        validateCustomDecorators: true, // 验证自定义装饰器
      });

      const validationTime = Date.now() - startTime;

      if (errors.length > 0) {
        const errorMessages = this.formatValidationErrors(errors);
        this.logger.warn(
          `Validation failed in ${validationTime}ms:`,
          errorMessages
        );

        throw new BadRequestException({
          message: '参数验证失败',
          details: errorMessages,
          validationTime,
        });
      }

      // 记录验证成功的性能指标
      if (validationTime > 100) {
        this.logger.warn(
          `Slow validation detected: ${validationTime}ms for ${metatype.name}`
        );
      }

      return object;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error(`Validation error for ${metatype.name}:`, error);
      throw new BadRequestException('参数验证过程中发生错误');
    }
  }

  /**
   * 检查是否需要验证
   */
  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  /**
   * 格式化验证错误信息
   */
  private formatValidationErrors(errors: any[]): string[] {
    const errorMessages: string[] = [];

    for (const error of errors) {
      if (error.constraints) {
        // 处理直接约束错误
        const constraints = Object.values(error.constraints);
        errorMessages.push(
          ...constraints.map(msg =>
            this.translateErrorMessage(String(msg), error.property)
          )
        );
      }

      if (error.children && error.children.length > 0) {
        // 处理嵌套对象错误
        const childErrors = this.formatValidationErrors(error.children);
        errorMessages.push(
          ...childErrors.map(msg => `${error.property}.${msg}`)
        );
      }
    }

    return errorMessages;
  }

  /**
   * 翻译错误信息为中文
   */
  private translateErrorMessage(message: string, property: string): string {
    const translations: Record<string, string> = {
      // 通用验证
      'must be a string': `${property} 必须是字符串`,
      'must be a number': `${property} 必须是数字`,
      'must be a boolean': `${property} 必须是布尔值`,
      'must be an integer': `${property} 必须是整数`,
      'must be a positive number': `${property} 必须是正数`,
      'must not be empty': `${property} 不能为空`,
      'must be defined': `${property} 是必需的`,

      // 长度验证
      'must be longer than or equal to': `${property} 长度不能少于`,
      'must be shorter than or equal to': `${property} 长度不能超过`,

      // 数值范围验证
      'must not be less than': `${property} 不能小于`,
      'must not be greater than': `${property} 不能大于`,

      // 格式验证
      'must be a valid email': `${property} 必须是有效的邮箱地址`,
      'must be a UUID': `${property} 必须是有效的UUID格式`,
      'must be a valid date': `${property} 必须是有效的日期格式`,
      'must be a valid ISO 8601 date string': `${property} 必须是有效的ISO 8601日期格式`,

      // 枚举验证
      'must be one of the following values': `${property} 必须是以下值之一`,
      'must be a valid enum value': `${property} 必须是有效的枚举值`,

      // 时间线特定验证
      'page must be a positive number': 'page 必须是正数',
      'limit must not be greater than 100': 'limit 不能超过100',
      'repoId must be a valid UUID': 'repoId 必须是有效的UUID格式',
      'type must be a valid timeline event type':
        'type 必须是有效的时间线事件类型',
      'startDate must be a valid ISO 8601 date':
        'startDate 必须是有效的ISO 8601日期格式',
      'endDate must be a valid ISO 8601 date':
        'endDate 必须是有效的ISO 8601日期格式',
      'period must be a valid aggregation period':
        'period 必须是有效的聚合周期',
      'days must be a positive integer': 'days 必须是正整数',
    };

    // 尝试精确匹配
    if (translations[message]) {
      return translations[message];
    }

    // 尝试模糊匹配
    for (const [pattern, translation] of Object.entries(translations)) {
      if (message.includes(pattern.split(' ')[0] || '')) {
        return translation;
      }
    }

    // 如果没有找到翻译，返回原始消息
    return `${property}: ${message}`;
  }

  /**
   * 验证时间范围
   */
  static validateDateRange(startDate?: string, endDate?: string): void {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start >= end) {
        throw new BadRequestException('开始时间必须早于结束时间');
      }

      // 限制查询范围不超过1年
      const oneYear = 365 * 24 * 60 * 60 * 1000;
      if (end.getTime() - start.getTime() > oneYear) {
        throw new BadRequestException('查询时间范围不能超过1年');
      }
    }
  }

  /**
   * 验证分页参数
   */
  static validatePagination(page?: number, limit?: number): void {
    if (page && page < 1) {
      throw new BadRequestException('页码必须大于0');
    }

    if (limit && (limit < 1 || limit > 100)) {
      throw new BadRequestException('每页数量必须在1-100之间');
    }
  }

  /**
   * 验证聚合周期
   */
  static validateAggregationPeriod(period: string): void {
    const validPeriods = ['HOUR', 'DAY', 'WEEK', 'MONTH'];
    if (!validPeriods.includes(period)) {
      throw new BadRequestException(
        `聚合周期必须是以下值之一: ${validPeriods.join(', ')}`
      );
    }
  }
}
