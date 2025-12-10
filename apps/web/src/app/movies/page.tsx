'use client';

import { useState } from 'react';
import {
  TrendingUp,
  Film,
  Star,
  Bookmark,
  Clock,
  BarChart3,
  Search,
  ChevronRight,
  MessageSquare,
  Sparkles,
  Heart,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MovieRow } from '@/components/movie/movie-row';
import Image from 'next/image';

export default function MoviesPage() {
  const [activeNav, setActiveNav] = useState('ai-recommend');
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [aiMessages, setAiMessages] = useState<
    Array<{ role: 'user' | 'assistant'; content: string }>
  >([
    {
      role: 'assistant',
      content: '你好！我是电影AI顾问。想看什么类型的电影？',
    },
  ]);

  const handleSendMessage = () => {
    if (!aiInput.trim()) return;

    // 添加用户消息
    setAiMessages(prev => [...prev, { role: 'user', content: aiInput }]);
    setAiInput('');

    // 模拟AI回复
    setTimeout(() => {
      setAiMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content:
            '根据你的需求，我推荐你观看《盗梦空间》，这是一部优秀的科幻电影！',
        },
      ]);
    }, 1000);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setAiChatOpen(true);
      setAiMessages(prev => [
        ...prev,
        { role: 'user', content: `搜索：${searchQuery}` },
        {
          role: 'assistant',
          content: `正在为你搜索"${searchQuery}"相关的电影...`,
        },
      ]);
    }
  };

  // 导航项
  const navItems = [
    { id: 'ai-recommend', label: 'AI推荐', icon: TrendingUp },
    { id: 'trending', label: '热门电影', icon: Film },
    { id: 'classics', label: '经典佳作', icon: Star },
    { id: 'favorites', label: '我的收藏', icon: Bookmark },
    { id: 'watchlist', label: '观影清单', icon: Clock },
    { id: 'history', label: '推荐历史', icon: BarChart3 },
  ];

  // 电影数据（使用真实TMDB海报）
  const featuredMovie = {
    title: '星际穿越',
    description: 'AI推荐：这部硬核科幻巨作探讨了时间、空间与爱的永恒命题',
    rating: '9.3',
    backdrop:
      'https://image.tmdb.org/t/p/w1280/xu9zaAevzQ5nnrsXN6JcahLnG4i.jpg',
  };

  const dailyRecommendations = [
    {
      id: 1,
      title: '肖申克的救赎',
      rating: '9.7',
      poster: 'https://image.tmdb.org/t/p/w342/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg',
      year: '1994',
    },
    {
      id: 2,
      title: '盗梦空间',
      rating: '9.3',
      poster: 'https://image.tmdb.org/t/p/w342/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg',
      year: '2010',
    },
    {
      id: 3,
      title: '泰坦尼克号',
      rating: '9.4',
      poster: 'https://image.tmdb.org/t/p/w342/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg',
      year: '1997',
    },
    {
      id: 4,
      title: '阿甘正传',
      rating: '9.5',
      poster: 'https://image.tmdb.org/t/p/w342/saHP97rTPS5eLmrLQEcANmKrsFl.jpg',
      year: '1994',
    },
    {
      id: 5,
      title: '千与千寻',
      rating: '9.4',
      poster: 'https://image.tmdb.org/t/p/w342/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
      year: '2001',
    },
    {
      id: 6,
      title: '辛德勒的名单',
      rating: '9.5',
      poster: 'https://image.tmdb.org/t/p/w342/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg',
      year: '1993',
    },
  ];

  const trendingMovies = [
    {
      id: 11,
      title: '沙丘',
      rating: '8.7',
      poster: 'https://image.tmdb.org/t/p/w342/d5NXSklXo0qyIYkgV94XAgMIckC.jpg',
      year: '2021',
    },
    {
      id: 12,
      title: '奥本海默',
      rating: '8.8',
      poster: 'https://image.tmdb.org/t/p/w342/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
      year: '2023',
    },
    {
      id: 13,
      title: '瞬息全宇宙',
      rating: '8.4',
      poster: 'https://image.tmdb.org/t/p/w342/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg',
      year: '2022',
    },
    {
      id: 14,
      title: '阿凡达：水之道',
      rating: '8.2',
      poster: 'https://image.tmdb.org/t/p/w342/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
      year: '2022',
    },
    {
      id: 15,
      title: '流浪地球2',
      rating: '8.3',
      poster: 'https://image.tmdb.org/t/p/w342/7UAaeNu1JPsixccHAhxqVzoqKW6.jpg',
      year: '2023',
    },
    {
      id: 16,
      title: '银翼杀手2049',
      rating: '8.3',
      poster: 'https://image.tmdb.org/t/p/w342/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg',
      year: '2017',
    },
  ];

  const classicMovies = [
    {
      id: 21,
      title: '教父',
      rating: '9.3',
      poster: 'https://image.tmdb.org/t/p/w342/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
      year: '1972',
    },
    {
      id: 22,
      title: '低俗小说',
      rating: '8.9',
      poster: 'https://image.tmdb.org/t/p/w342/dRfyPvGH2CkJzBKg8VqZfFZy9fV.jpg',
      year: '1994',
    },
    {
      id: 23,
      title: '搏击俱乐部',
      rating: '9.0',
      poster: 'https://image.tmdb.org/t/p/w342/bptfVGEQuv6vDTIMVCHjJ9Dz8PX.jpg',
      year: '1999',
    },
    {
      id: 24,
      title: '黑客帝国',
      rating: '9.0',
      poster: 'https://image.tmdb.org/t/p/w342/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
      year: '1999',
    },
    {
      id: 25,
      title: '楚门的世界',
      rating: '9.3',
      poster: 'https://image.tmdb.org/t/p/w342/vuza0WqY239yBXOadKlGwJsZJFE.jpg',
      year: '1998',
    },
    {
      id: 26,
      title: '美丽人生',
      rating: '9.5',
      poster: 'https://image.tmdb.org/t/p/w342/74hLDKjD5aGYOotO6esUVaeISa2.jpg',
      year: '1997',
    },
  ];

  return (
    <div className="min-h-screen bg-[#2E3440] text-[#ECEFF4]">
      {/* 顶部栏 */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-[#2E3440]/95 backdrop-blur-sm border-b border-[#4C566A]/30 z-50 flex items-center px-6">
        <div className="flex items-center gap-3">
          <Film className="w-8 h-8 text-[#88C0D0]" />
          <span className="text-xl font-semibold">电影AI平台</span>
        </div>

        <div className="flex-1 max-w-md mx-8">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D8DEE9]/40" />
            <Input
              placeholder="搜索电影、导演、演员..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#3B4252] border-[#4C566A]/30 text-[#D8DEE9] placeholder:text-[#D8DEE9]/40 focus:border-[#88C0D0]/50"
            />
          </form>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-[#D8DEE9] hover:bg-[#3B4252]"
            onClick={() => setAiChatOpen(!aiChatOpen)}
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            AI助手
          </Button>
        </div>
      </header>

      <div className="flex pt-16">
        {/* 左侧导航 */}
        <aside className="fixed left-0 top-16 bottom-0 w-48 bg-[#2E3440] border-r border-[#4C566A]/30 p-4">
          <nav className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-[#88C0D0]/10 text-[#88C0D0]'
                      : 'text-[#D8DEE9]/70 hover:bg-[#3B4252] hover:text-[#D8DEE9]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* 主内容区 */}
        <main className="ml-48 flex-1 p-6">
          {/* 页面标题提示 */}
          {activeNav !== 'ai-recommend' && (
            <div className="mb-6 p-4 bg-[#3B4252] border border-[#4C566A]/30 rounded-lg">
              <p className="text-[#D8DEE9] text-center">
                {activeNav === 'favorites' &&
                  '你的收藏列表为空，快去发现喜欢的电影吧！'}
                {activeNav === 'watchlist' &&
                  '你的观影清单为空，添加想看的电影到清单！'}
                {activeNav === 'history' && '暂无推荐历史记录'}
                {activeNav === 'trending' && '以下是当前热门电影'}
                {activeNav === 'classics' && '这些是经典佳作'}
              </p>
            </div>
          )}

          {/* 精选横幅 */}
          {activeNav === 'ai-recommend' && (
            <div className="relative h-64 rounded-xl overflow-hidden mb-8 group">
              <Image
                src={featuredMovie.backdrop}
                alt={featuredMovie.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#2E3440]/95 via-[#2E3440]/60 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-center p-8">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-[#EBCB8B] fill-[#EBCB8B]" />
                  <span className="text-[#EBCB8B] font-semibold">
                    {featuredMovie.rating}
                  </span>
                </div>
                <h2 className="text-4xl font-bold mb-3">
                  {featuredMovie.title}
                </h2>
                <p className="text-[#D8DEE9]/80 max-w-md mb-4">
                  {featuredMovie.description}
                </p>
                <div>
                  <Button
                    onClick={() => {
                      setAiChatOpen(true);
                      setAiMessages(prev => [
                        ...prev,
                        {
                          role: 'user',
                          content: '告诉我关于《星际穿越》的更多信息',
                        },
                      ]);
                    }}
                    className="bg-[#88C0D0] text-[#2E3440] hover:bg-[#88C0D0]/90"
                  >
                    立即咨询AI
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* 每日推荐 */}
          <MovieRow
            title="每日推荐"
            movies={dailyRecommendations}
            icon={<Sparkles className="w-5 h-5 text-[#EBCB8B]" />}
          />

          {/* 热门榜单 */}
          <MovieRow
            title="热门榜单"
            movies={trendingMovies}
            icon={<TrendingUp className="w-5 h-5 text-[#BF616A]" />}
          />

          {/* 经典佳作 */}
          <MovieRow
            title="经典佳作"
            movies={classicMovies}
            icon={<Award className="w-5 h-5 text-[#B48EAD]" />}
          />

          {/* 分类推荐 */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Film className="w-5 h-5 text-[#81A1C1]" />
                分类推荐
              </h3>
            </div>
            <div className="flex gap-2 flex-wrap">
              {[
                '科幻',
                '爱情',
                '悬疑',
                '动作',
                '喜剧',
                '动画',
                '剧情',
                '恐怖',
              ].map(genre => (
                <Button
                  key={genre}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedGenre(genre);
                    setAiChatOpen(true);
                    setAiMessages(prev => [
                      ...prev,
                      { role: 'user', content: `推荐${genre}类型的电影` },
                      {
                        role: 'assistant',
                        content: `好的！为你推荐几部优秀的${genre}电影...`,
                      },
                    ]);
                  }}
                  className={`border-[#4C566A] bg-[#3B4252] text-[#D8DEE9] hover:bg-[#4C566A] hover:text-[#88C0D0] hover:border-[#88C0D0]/30 ${
                    selectedGenre === genre
                      ? 'bg-[#88C0D0]/20 border-[#88C0D0]/50 text-[#88C0D0]'
                      : ''
                  }`}
                >
                  {genre}
                </Button>
              ))}
            </div>
          </section>
        </main>
      </div>

      {/* AI浮动助手 */}
      {aiChatOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-[#3B4252] border border-[#4C566A]/50 rounded-xl shadow-2xl z-50">
          <div className="flex items-center justify-between p-4 border-b border-[#4C566A]/30">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#88C0D0] rounded-full flex items-center justify-center">
                <Film className="w-5 h-5 text-[#2E3440]" />
              </div>
              <span className="font-medium">电影AI顾问</span>
            </div>
            <button
              onClick={() => setAiChatOpen(false)}
              className="text-[#D8DEE9]/60 hover:text-[#D8DEE9]"
            >
              ✕
            </button>
          </div>
          <div className="p-4 h-[calc(100%-8rem)] overflow-y-auto space-y-3">
            {aiMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`${
                  msg.role === 'user' ? 'ml-auto' : ''
                } max-w-[80%] ${
                  msg.role === 'user'
                    ? 'bg-[#88C0D0]/20 text-[#ECEFF4]'
                    : 'bg-[#434C5E] text-[#D8DEE9]'
                } rounded-lg p-3`}
              >
                <p className="text-sm">{msg.content}</p>
              </div>
            ))}
          </div>
          <div className="absolute bottom-0 left-0 right-0 border-t border-[#4C566A]/30">
            {/* 快捷问题 */}
            {aiMessages.length === 1 && (
              <div className="p-3 flex flex-wrap gap-2 border-b border-[#4C566A]/20">
                {['推荐科幻片', '最新电影', '经典佳作', '高分电影'].map(q => (
                  <button
                    key={q}
                    onClick={() => {
                      setAiMessages(prev => [
                        ...prev,
                        { role: 'user', content: q },
                      ]);
                    }}
                    className="text-xs px-3 py-1.5 bg-[#434C5E] text-[#D8DEE9]/80 rounded-full hover:bg-[#4C566A] hover:text-[#88C0D0] transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
            <div className="p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="输入消息..."
                  value={aiInput}
                  onChange={e => setAiInput(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                  className="bg-[#434C5E] border-[#4C566A]/30 text-[#D8DEE9] placeholder:text-[#D8DEE9]/40"
                />
                <Button
                  onClick={handleSendMessage}
                  className="bg-[#88C0D0] text-[#2E3440] hover:bg-[#88C0D0]/90"
                >
                  发送
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
