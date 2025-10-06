'use client';

import { lazy, Suspense } from 'react';
import { LoadingHint } from './loading-hint';

// 懒加载 SnapshotCodeViewer 组件
const SnapshotCodeViewerComponent = lazy(() =>
  import('./snapshot-code-viewer').then(module => ({
    default: module.SnapshotCodeViewer,
  }))
);

interface SnapshotCodeViewerLazyProps {
  snapshotId: string;
  commitSha: string;
  className?: string;
  onRecover?: () => void;
  onInvalid?: () => void;
}

export function SnapshotCodeViewerLazy(props: SnapshotCodeViewerLazyProps) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-96">
          <LoadingHint message="正在加载代码查看器..." />
        </div>
      }
    >
      <SnapshotCodeViewerComponent {...props} />
    </Suspense>
  );
}
