'use client';

import { Button } from '@/components/ui/button';
import { Lock, Unlock } from 'lucide-react';
import { useEffect, useState } from 'react';

export function PageLockButton() {
  const [isPageLocked, setIsPageLocked] = useState(false);

  // 控制页面滚动锁定
  useEffect(() => {
    if (isPageLocked) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isPageLocked]);

  return (
    <Button
      onClick={() => setIsPageLocked(!isPageLocked)}
      className={`fixed bottom-80 right-6 h-32 w-32 rounded-full shadow-lg transition-all hover:scale-110 z-50 ${
        isPageLocked
          ? 'bg-gradient-to-r from-primary to-primary/80'
          : 'bg-muted hover:bg-muted-foreground/10'
      }`}
      size="icon"
      aria-label={isPageLocked ? '解锁页面滚动' : '锁定页面滚动'}
      title={isPageLocked ? '解锁页面滚动' : '锁定页面滚动'}
    >
      {isPageLocked ? (
        <Lock className="h-11 w-11 text-white" />
      ) : (
        <Unlock className="h-11 w-11" />
      )}
    </Button>
  );
}
