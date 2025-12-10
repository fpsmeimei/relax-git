/**
 * TMDB (The Movie Database) API 集成
 * 获取电影海报、详细信息等
 */

// 从环境变量读取 API Keys（如果没有配置则使用本地mock）
const TMDB_API_KEY = process.env['NEXT_PUBLIC_TMDB_API_KEY'] || '';
const OMDB_API_KEY = process.env['NEXT_PUBLIC_OMDB_API_KEY'] || '';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const OMDB_BASE_URL = 'https://www.omdbapi.com';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  release_date: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  vote_count: number;
  genres?: Array<{ id: number; name: string }>;
}

/**
 * 搜索电影（仅返回真实电影）
 * 找不到时返回 null，不再使用 mock 数据
 */
export async function searchMovie(
  query: string,
  year?: string
): Promise<TMDBMovie | null> {
  try {
    // 优先尝试 OMDb API（更简单，响应更快）
    if (OMDB_API_KEY) {
      const omdbResult = await searchWithOMDb(query, year);
      if (omdbResult) {
        console.log(`[OMDb] 找到电影: ${omdbResult.title}`);
        return omdbResult;
      }
    }

    // 备选：尝试 TMDB API
    if (TMDB_API_KEY) {
      const url = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=zh-CN${year ? `&year=${year}` : ''}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        const movie = data.results?.[0];
        if (movie) {
          console.log(`[TMDB] 找到电影: ${movie.title}`);
          return movie;
        }
      }
    }

    // 找不到真实电影，返回 null（不显示卡片）
    console.log(`[Search] 未找到电影: ${query}`);
    return null;
  } catch (error) {
    console.error('Movie API error:', error);
    return null;
  }
}

/**
 * 获取电影海报 URL
 */
export function getPosterUrl(
  posterPath: string | null,
  size: 'w154' | 'w342' | 'w500' | 'original' = 'w342'
): string {
  if (!posterPath) {
    return '/placeholder-movie.jpg'; // 使用占位图
  }
  // 如果已经是完整 URL（http/https 开头），直接返回
  if (posterPath.startsWith('http://') || posterPath.startsWith('https://')) {
    return posterPath;
  }
  // 否则认为是 TMDB 路径，拼接 TMDB CDN
  return `${TMDB_IMAGE_BASE_URL}/${size}${posterPath}`;
}

/**
 * 获取背景图 URL
 */
export function getBackdropUrl(
  backdropPath: string | null,
  size: 'w300' | 'w780' | 'w1280' | 'original' = 'w780'
): string {
  if (!backdropPath) {
    return '';
  }
  return `${TMDB_IMAGE_BASE_URL}/${size}${backdropPath}`;
}

/**
 * 使用 OMDb API 搜索电影
 */
async function searchWithOMDb(
  query: string,
  year?: string
): Promise<TMDBMovie | null> {
  try {
    const url = `${OMDB_BASE_URL}/?apikey=${OMDB_API_KEY}&t=${encodeURIComponent(query)}${year ? `&y=${year}` : ''}`;
    const response = await fetch(url);

    if (!response.ok) return null;

    const data = await response.json();

    if (data.Response === 'False') return null;

    // 转换 OMDb 格式到统一的 TMDBMovie 格式
    return {
      id: parseInt(data.imdbID.replace('tt', ''), 10) || 0,
      title: data.Title,
      original_title: data.Title,
      release_date: data.Released || data.Year,
      poster_path: data.Poster !== 'N/A' ? data.Poster : null,
      backdrop_path: null,
      overview: data.Plot !== 'N/A' ? data.Plot : '',
      vote_average: parseFloat(data.imdbRating) || 0,
      vote_count: parseInt(data.imdbVotes?.replace(/,/g, ''), 10) || 0,
    };
  } catch (error) {
    console.error('OMDb API error:', error);
    return null;
  }
}
