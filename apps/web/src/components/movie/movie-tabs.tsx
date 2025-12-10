'use client';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bookmark,
  Clock,
  TrendingUp,
  Film,
  Star,
  BarChart3,
  Sparkles,
} from 'lucide-react';

export function MovieTabs() {
  return (
    <div className="border-t border-[#4C566A]/30 bg-[#3B4252]">
      <Tabs defaultValue="recommend" className="w-full">
        <TabsList className="w-full justify-start h-12 bg-transparent border-b border-[#4C566A]/20 rounded-none px-3 gap-1">
          <TabsTrigger
            value="recommend"
            className="px-3 py-2 text-sm text-[#D8DEE9] rounded-md transition-colors data-[state=active]:bg-[#88C0D0]/10 data-[state=active]:text-[#88C0D0] hover:bg-[#434C5E]"
          >
            <TrendingUp className="w-4 h-4 mr-1.5" />
            <span>智能推荐</span>
          </TabsTrigger>

          <TabsTrigger
            value="favorites"
            className="px-3 py-2 text-sm text-[#D8DEE9] rounded-md transition-colors data-[state=active]:bg-[#88C0D0]/10 data-[state=active]:text-[#88C0D0] hover:bg-[#434C5E]"
          >
            <Bookmark className="w-4 h-4 mr-1.5" />
            <span>收藏</span>
          </TabsTrigger>

          <TabsTrigger
            value="watchlist"
            className="px-3 py-2 text-sm text-[#D8DEE9] rounded-md transition-colors data-[state=active]:bg-[#88C0D0]/10 data-[state=active]:text-[#88C0D0] hover:bg-[#434C5E]"
          >
            <Clock className="w-4 h-4 mr-1.5" />
            <span>清单</span>
          </TabsTrigger>

          <TabsTrigger
            value="history"
            className="px-3 py-2 text-sm text-[#D8DEE9] rounded-md transition-colors data-[state=active]:bg-[#88C0D0]/10 data-[state=active]:text-[#88C0D0] hover:bg-[#434C5E]"
          >
            <BarChart3 className="w-4 h-4 mr-1.5" />
            <span>历史</span>
          </TabsTrigger>
        </TabsList>

        {/* 智能推荐 */}
        <TabsContent value="recommend" className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-[#D8DEE9] mb-3">
            <Film className="w-4 h-4" />
            <span>基于你的偏好智能推荐</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="justify-start h-10 border-[#4C566A] bg-[#434C5E] text-[#D8DEE9] hover:bg-[#4C566A] hover:text-[#88C0D0] hover:border-[#88C0D0]/30 transition-colors"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              <span>热门推荐</span>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-10 border-[#4C566A] bg-[#434C5E] text-[#D8DEE9] hover:bg-[#4C566A] hover:text-[#88C0D0] hover:border-[#88C0D0]/30 transition-colors"
            >
              <Film className="w-4 h-4 mr-2" />
              <span>经典佳作</span>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-10 border-[#4C566A] bg-[#434C5E] text-[#D8DEE9] hover:bg-[#4C566A] hover:text-[#88C0D0] hover:border-[#88C0D0]/30 transition-colors"
            >
              <Star className="w-4 h-4 mr-2" />
              <span>高分电影</span>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-10 border-[#4C566A] bg-[#434C5E] text-[#D8DEE9] hover:bg-[#4C566A] hover:text-[#EBCB8B] hover:border-[#EBCB8B]/30 transition-colors"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              <span>最新上映</span>
            </Button>
          </div>
        </TabsContent>

        {/* 我的收藏 */}
        <TabsContent value="favorites" className="p-4">
          <div className="text-center py-8 text-[#616E88]">
            <Bookmark className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm text-[#D8DEE9]/60">暂无收藏</p>
          </div>
        </TabsContent>

        {/* 观影清单 */}
        <TabsContent value="watchlist" className="p-4">
          <div className="text-center py-8 text-[#616E88]">
            <Clock className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm text-[#D8DEE9]/60">清单为空</p>
          </div>
        </TabsContent>

        {/* 推荐历史 */}
        <TabsContent value="history" className="p-4">
          <div className="text-center py-8 text-[#616E88]">
            <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm text-[#D8DEE9]/60">暂无记录</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
