import { format, differenceInMinutes, differenceInHours } from 'date-fns';
import { zhCN } from 'date-fns/locale';

/**
 * 智能时间格式化
 * - 24小时内：显示相对时间（如"3小时前"）
 * - 超过24小时：显示年月日（如"2025-01-15"）
 */
export function formatSmartTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // 检查是否为有效日期
  if (isNaN(dateObj.getTime())) {
    return '无效日期';
  }

  const now = new Date();
  const minutesAgo = differenceInMinutes(now, dateObj);
  const hoursAgo = differenceInHours(now, dateObj);

  // 24小时内显示相对时间（不带"大约"）
  if (hoursAgo < 24) {
    if (minutesAgo < 1) {
      return '刚刚';
    } else if (minutesAgo < 60) {
      return `${minutesAgo}分钟前`;
    } else {
      return `${hoursAgo}小时前`;
    }
  }

  // 超过24小时只显示年月日
  return format(dateObj, 'yyyy-MM-dd', { locale: zhCN });
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
