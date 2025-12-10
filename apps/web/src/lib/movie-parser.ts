/**
 * 电影信息解析器
 * 从 AI 回复中提取结构化的电影信息
 */

/**
 * 转义正则表达式特殊字符
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export interface ParsedMovie {
  title: string;
  englishName?: string; // 英文名，用于 OMDb 查询
  year?: string;
  rating?: string;
  director?: string;
  description?: string;
  posterUrl?: string; // 海报 URL
}

export interface ParsedMessage {
  text: string;
  movies: ParsedMovie[];
}

/**
 * 解析 AI 回复，提取电影信息
 *
 * 支持格式：
 * 《电影名》(年份) [English Name] - 豆瓣X.X
 * 导演：XXX
 * 描述：XXX
 */
export function parseMovieMessage(content: string): ParsedMessage {
  const movies: ParsedMovie[] = [];

  // 匹配电影信息的正则表达式
  // 格式: 《电影名》(年份) [English Name] - 豆瓣X.X 或 评分X.X
  const movieRegex =
    /《([^》]+)》\s*(?:\((\d{4})\))?\s*(?:\[([^\]]+)\])?\s*(?:[-–—]\s*(?:豆瓣|评分|IMDb)?\s*([\d.]+))?/g;

  let match;
  const processedTitles = new Set<string>();

  while ((match = movieRegex.exec(content)) !== null) {
    const title = match[1];

    // 避免重复
    if (processedTitles.has(title)) continue;
    processedTitles.add(title);

    const year = match[2];
    const englishName = match[3]; // 英文名
    const rating = match[4];

    // 尝试提取导演信息（在电影名后面）
    let director: string | undefined;
    try {
      const directorMatch = content.match(
        new RegExp(
          `《${escapeRegex(title)}》[^导]*导演[：:]\s*([^\n，。,]+)`,
          'i'
        )
      );
      director = directorMatch?.[1]?.trim();
    } catch (e) {
      // 忽略正则表达式错误
    }

    // 尝试提取描述（在电影名后的句子）
    let description: string | undefined;
    try {
      const descMatch = content.match(
        new RegExp(
          `《${escapeRegex(title)}》[^。！？\n]*?([^。！？\n]{20,100}[。！？])`,
          'i'
        )
      );
      description = descMatch?.[1]?.trim();
    } catch (e) {
      // 忽略正则表达式错误
    }

    movies.push({
      title,
      englishName: englishName || undefined,
      year: year || undefined,
      rating: rating || undefined,
      director: director || undefined,
      description: description || undefined,
    });
  }

  return {
    text: content,
    movies,
  };
}

/**
 * 检查消息是否包含电影推荐
 */
export function hasMovieRecommendations(content: string): boolean {
  return /《[^》]+》/.test(content);
}
