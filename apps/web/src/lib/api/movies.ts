/**
 * 电影收藏 API
 */

interface MovieFavorite {
  id: string;
  title: string;
  englishName?: string;
  year?: string;
  rating?: string;
  director?: string;
  posterUrl?: string;
  createdAt: string;
}

interface CreateMovieFavoriteDto {
  title: string;
  englishName?: string;
  year?: string;
  rating?: string;
  director?: string;
  posterUrl?: string;
}

interface FavoritesResponse {
  favorites: MovieFavorite[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 添加收藏
 */
export async function addMovieFavorite(
  data: CreateMovieFavoriteDto
): Promise<MovieFavorite> {
  const response = await fetch('/api/movies/favorites', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to add favorite');
  }

  return response.json();
}

/**
 * 获取收藏列表
 */
export async function getMovieFavorites(
  page = 1,
  pageSize = 10
): Promise<FavoritesResponse> {
  const response = await fetch(
    `/api/movies/favorites?page=${page}&pageSize=${pageSize}`,
    {
      credentials: 'include',
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error('Failed to get favorites:', response.status, error);
    throw new Error(`Failed to get favorites: ${response.status}`);
  }

  return response.json();
}

/**
 * 删除收藏
 */
export async function removeMovieFavorite(favoriteId: string): Promise<void> {
  const response = await fetch(`/api/movies/favorites/${favoriteId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to remove favorite');
  }
}

/**
 * 检查是否已收藏
 */
export async function checkMovieFavorite(title: string): Promise<boolean> {
  const response = await fetch(
    `/api/movies/favorites/check/${encodeURIComponent(title)}`,
    {
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw new Error('Failed to check favorite');
  }

  const data = await response.json();
  return data.isFavorited;
}
