import { formatDistanceToNow, format, differenceInHours } from 'date-fns';
import { zhCN } from 'date-fns/locale';

/**
 * 智能时间格式化
 * - 24小时内：显示相对时间（如"3小时前"）
 * - 超过24小时：显示具体时间（如"2025-01-15 14:30"）
 */
export function formatSmartTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // 检查是否为有效日期
  if (isNaN(dateObj.getTime())) {
    return '无效日期';
  }

  const hoursAgo = differenceInHours(new Date(), dateObj);

  // 24小时内显示相对时间
  if (hoursAgo < 24) {
    return formatDistanceToNow(dateObj, {
      addSuffix: true,
      locale: zhCN,
    });
  }

  // 超过24小时显示具体时间
  return format(dateObj, 'yyyy-MM-dd HH:mm', { locale: zhCN });
}

/**
 * 格式化日期（仅日期部分）
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return '无效日期';
  }

  return format(dateObj, 'yyyy-MM-dd', { locale: zhCN });
}

/**
 * 格式化日期时间（完整格式）
 */
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return '无效日期';
  }

  return format(dateObj, 'yyyy-MM-dd HH:mm:ss', { locale: zhCN });
}
