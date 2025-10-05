'use client';

import { Button } from '@/components/ui/button';
import { apiClient } from '@/services/apiClient';
import {
  ArrowUp,
  Eye,
  FileText,
  Maximize2,
  MessageCircle,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import Prism from 'prismjs';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FeedbackBanner } from './feedback-banner';
import { LineCommentInlinePanel } from './line-comment-inline-panel';
import { LoadingHint } from './loading-hint';
import { SetiFileIcon, SetiFolderIcon } from './seti-icons';

interface SnapshotCodeViewerProps {
  snapshotId: string;
  commitSha: string;
  className?: string;
  onRecover?: () => void; // 当会话/工作树缺失时由父组件触发重建
  onInvalid?: () => void; // 检测到失效（404等）时回调父组件清理本地会话
}

interface FileTreeNode {
  name: string;
  type: 'dir' | 'file';
  size?: number;
}

interface LineCommentData {
  filePath: string;
  lineNumber: number;
  repoOwnerId?: string; // 仓库所有者ID
  comments: Array<{
    id: string;
    content: string;
    author: string;
    authorId?: string;
    createdAt: string;
    likes?: number;
    isLiked?: boolean;
    replies?: Array<{
      id: string;
      content: string;
      author: string;
      authorId?: string;
      createdAt: string;
      likes?: number;
      isLiked?: boolean;
      parentAuthor?: string; // 被回复者的用户名
    }>;
  }>;
}

export function SnapshotCodeViewer({
  snapshotId,
  commitSha,
  className = '',
  onRecover,
  onInvalid,
}: SnapshotCodeViewerProps) {
  const [fileTree, setFileTree] = useState<FileTreeNode[]>([]);
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set([''])); // 默认展开根目录
  const [currentPath, setCurrentPath] = useState<string>(''); // 当前浏览的目录路径
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const selectedFileRef = useRef<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [fileMime, setFileMime] = useState<string | null>(null);
  const [fileIsBinary, setFileIsBinary] = useState<boolean>(false);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  // 图片预览增强：缩放/全屏
  const imgContainerRef = useRef<HTMLDivElement | null>(null);
  const [imgZoom, setImgZoom] = useState(1);
  // 代码区缩放/全屏
  const codeContainerRef = useRef<HTMLDivElement | null>(null);
  const DEFAULT_ZOOM = 1.25;
  const [codeZoom, setCodeZoom] = useState(DEFAULT_ZOOM);
  const [loading, setLoading] = useState(false);
  const [loadingFile, setLoadingFile] = useState(false);
  const [treeError, setTreeError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [canRecover, setCanRecover] = useState(false);
  // 源模式：优先使用 snapshots 接口；失败时回退到 artifacts 接口
  const [sourceMode, setSourceMode] = useState<'snapshot' | 'artifact'>(
    'snapshot'
  );
  const [artifactId, setArtifactId] = useState<string | null>(null);

  // 行级评论相关状态
  const [lineComments, setLineComments] = useState<
    Record<string, LineCommentData>
  >({});
  // 语法高亮相关状态
  const [highlightedLines, setHighlightedLines] = useState<string[] | null>(
    null
  );

  useEffect(() => {
    selectedFileRef.current = selectedFile;
  }, [selectedFile]);

  const inferPrismLang = useCallback(
    (fileName: string | null): { lang: string; component: string } => {
      if (!fileName) return { lang: 'tsx', component: 'tsx' };
      const lower = fileName.toLowerCase();
      if (lower.endsWith('.tsx')) return { lang: 'tsx', component: 'tsx' };
      if (lower.endsWith('.ts'))
        return { lang: 'typescript', component: 'typescript' };
      if (lower.endsWith('.jsx')) return { lang: 'jsx', component: 'jsx' };
      if (lower.endsWith('.js'))
        return { lang: 'javascript', component: 'javascript' };
      if (lower.endsWith('.json')) return { lang: 'json', component: 'json' };
      if (lower.endsWith('.css')) return { lang: 'css', component: 'css' };
      if (lower.endsWith('.html') || lower.endsWith('.htm'))
        return { lang: 'markup', component: 'markup' };
      if (lower.endsWith('.md') || lower.endsWith('.markdown'))
        return { lang: 'markdown', component: 'markdown' };
      if (lower.endsWith('.yml') || lower.endsWith('.yaml'))
        return { lang: 'yaml', component: 'yaml' };
      if (lower.endsWith('.toml')) return { lang: 'toml', component: 'toml' };
      if (lower.endsWith('.sh')) return { lang: 'bash', component: 'bash' };
      if (lower.endsWith('dockerfile'))
        return { lang: 'docker', component: 'docker' };
      return { lang: 'tsx', component: 'tsx' };
    },
    []
  );

  // 动态按需加载 Prism 语言并生成逐行高亮 HTML
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        if (!selectedFile || !fileContent || fileIsBinary) {
          setHighlightedLines(null);
          return;
        }
        // 大文件回退为纯文本
        if (fileContent.length > 500_000) {
          setHighlightedLines(null);
          return;
        }
        const { lang, component } = inferPrismLang(selectedFile);
        // 确保语言已加载
        if (!Prism.languages[lang]) {
          try {
            await import(
              /* webpackChunkName: "prism-lang-[request]" */ `prismjs/components/prism-${component}.js`
            );
            // 给一个小的延迟确保语言组件完全注册
            await new Promise(resolve => setTimeout(resolve, 10));

            // 如果导入后仍然没有语言，尝试一些常见的别名
            if (!Prism.languages[lang]) {
              // 某些语言可能有别名，比如 'tsx' 可以使用 'jsx' 的语法
              const aliases: Record<string, string> = {
                tsx: 'jsx',
                ts: 'typescript',
                js: 'javascript',
                md: 'markdown',
                yml: 'yaml',
              };
              const aliasLang = aliases[lang];
              if (aliasLang && Prism.languages[aliasLang]) {
                // 开发环境下提示使用了别名
                if (process.env.NODE_ENV === 'development') {
                  console.info(
                    `Using alias language '${aliasLang}' for '${lang}'`
                  );
                }
              }
            }
          } catch (error) {
            // 开发环境下输出调试信息
            if (process.env.NODE_ENV === 'development') {
              console.warn(
                `Failed to load Prism language component: ${component}`,
                error
              );
            }
          }
        }
        // 导入后再次检查，确保语言已正确注册
        const grammar = Prism.languages[lang] || Prism.languages.markup;
        const lines = fileContent.split('\n');
        const htmlLines = lines.map(line => {
          try {
            return Prism.highlight(line, grammar, lang);
          } catch {
            // 回退：对特殊字符做简单转义
            return line
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;');
          }
        });
        if (!cancelled) setHighlightedLines(htmlLines);
      } catch {
        if (!cancelled) setHighlightedLines(null);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [selectedFile, fileContent, fileIsBinary, inferPrismLang]);

  // “网页全屏”模式：仅在页面内最大化容器，不使用浏览器原生全屏
  // 记忆缩放偏好
  useEffect(() => {
    try {
      const saved = localStorage.getItem('rg_code_zoom');
      if (saved) {
        const z = parseFloat(saved);
        if (!Number.isNaN(z) && z > 0) {
          setCodeZoom(z);
          return;
        }
      }
    } catch {}
    setCodeZoom(DEFAULT_ZOOM);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCodeKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && (e.key === '+' || e.key === '=')) {
        e.preventDefault();
        setCodeZoom(z => Math.min(2.5, +(z + 0.125).toFixed(3)));
      } else if (mod && (e.key === '-' || e.key === '_')) {
        e.preventDefault();
        setCodeZoom(z => Math.max(0.5, +(z - 0.125).toFixed(3)));
      } else if (mod && e.key === '0') {
        e.preventDefault();
        setCodeZoom(DEFAULT_ZOOM);
      }
    },
    [DEFAULT_ZOOM]
  );

  const handleCodeWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY;
      if (delta > 0) {
        setCodeZoom(z => Math.max(0.5, +(z - 0.125).toFixed(3)));
      } else if (delta < 0) {
        setCodeZoom(z => Math.min(2.5, +(z + 0.125).toFixed(3)));
      }
    }
  }, []);

  const [expandedLineKeys, setExpandedLineKeys] = useState<Set<string>>(
    new Set()
  );
  const [commentsError, setCommentsError] = useState<string | null>(null);

  // URL 深链锚点处理避免重复触发
  const [handledAnchor, setHandledAnchor] = useState(false);
  const searchParams = useSearchParams();
  // 若 URL 已指定 file，则跳过初始默认文件选择，防止覆盖定位
  const initialFileFromUrl = useMemo(() => {
    try {
      return searchParams?.get('file') || null;
    } catch {
      return null;
    }
  }, [searchParams]);

  // 获取需要高亮的评论ID
  const highlightCommentId = useMemo(() => {
    try {
      return searchParams?.get('commentId') || null;
    } catch {
      return null;
    }
  }, [searchParams]);

  const handleScrollToTop = useCallback(() => {
    try {
      codeContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {}
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {}
  }, []);

  // 统一使用snapshots端点，移除复杂的类型检测
  const getApiPath = useCallback(
    (endpoint: 'tree' | 'file') => {
      if (sourceMode === 'artifact' && artifactId) {
        return `/artifacts/${artifactId}/${endpoint}`;
      }
      return `/snapshots/${snapshotId}/${endpoint}`;
    },
    [snapshotId, sourceMode, artifactId]
  );

  // 加载文件的行级评论
  const loadLineComments = useCallback(
    async (filePath: string) => {
      try {
        setCommentsError(null);
        const { data } = await apiClient.get<{
          comments: any[];
          total: number;
        }>(`/comments/by-snapshot/${snapshotId}`, {
          params: {
            filePath,
            anchorType: 'LINE', // 仅拉取行级评论
            page: 1,
            limit: 100,
          },
        });

        const repoOwnerId = (data as any)?.repoOwnerId as string | undefined;
        const list: any[] = Array.isArray((data as any)?.comments)
          ? (data as any).comments
          : [];

        // 1) 统一扁平 -> 树（避免服务端是否嵌套带来的差异）
        type Flat = {
          id: string;
          parentId?: string | null;
          content: string;
          createdAt: string;
          author?: { id?: string; username?: string; avatar?: string };
          parent?: {
            id: string;
            author: {
              id: string;
              username: string;
              avatar?: string;
            };
          } | null;
          _count?: { likes?: number };
          likesCount?: number;
          liked?: boolean;
          lineStart?: number | null;
          filePath?: string | null;
          replies?: Flat[];
        };

        const byId = new Map<string, Flat>();
        const children: Record<string, Flat[]> = {};

        // 收集所有项，并建立 byId
        for (const raw of list as Flat[]) {
          byId.set(raw.id, raw);
        }

        // 建立 children 映射（统一使用扁平 parentId 进行挂载）
        for (const raw of list as Flat[]) {
          if (!raw.parentId) continue;
          const pid = raw.parentId as string;
          if (!children[pid]) children[pid] = [];
          children[pid]!.push(raw);
        }

        // 2) 生成每行的线程：仅以顶级（无 parentId）的评论为根
        const commentsByLine: Record<string, LineCommentData> = {};
        for (const raw of list as Flat[]) {
          if (raw.parentId) continue; // 仅根评论
          if (!raw.lineStart) continue; // 没有行号无法作为行线程

          const key = `${filePath}:${raw.lineStart}`;
          if (!commentsByLine[key]) {
            const thread: LineCommentData = {
              filePath,
              lineNumber: raw.lineStart,
              comments: [],
            };
            if (typeof repoOwnerId === 'string') {
              (thread as any).repoOwnerId = repoOwnerId;
            }
            commentsByLine[key] = thread;
          }

          const toReply = (r: Flat) => {
            const likes = (r.likesCount ?? r._count?.likes ?? 0) as number;
            const item: any = {
              id: r.id,
              content: r.content,
              author: r.author?.username || '未知用户',
              createdAt: r.createdAt,
              likes,
              isLiked: !!r.liked,
              authorAvatar: r.author?.avatar,
            };
            if (r.author?.id) item.authorId = r.author.id;

            // 添加被回复者的用户名
            if (r.parent?.author?.username) {
              // 优先使用后端返回的parent信息
              item.parentAuthor = r.parent.author.username;
            } else if (r.parentId) {
              // 回退到通过parentId查找
              const parentComment = byId.get(r.parentId);
              if (parentComment?.author?.username) {
                item.parentAuthor = parentComment.author.username;
              }
            }

            return item;
          };

          // 优先使用扁平 children，若无则回退到服务端嵌套 replies
          const directChildren = children[raw.id] || raw.replies || [];

          const likes = (raw.likesCount ?? raw._count?.likes ?? 0) as number;
          const commentItem: any = {
            id: raw.id,
            content: raw.content,
            author: raw.author?.username || '未知用户',
            createdAt: raw.createdAt,
            likes,
            isLiked: !!raw.liked,
            replies: directChildren.map(toReply),
            authorAvatar: raw.author?.avatar,
          };
          if (raw.author?.id) commentItem.authorId = raw.author.id;

          const thread = commentsByLine[key]!;
          thread.comments.push(commentItem);
        }

        // 3) 写入状态（替换该文件所有旧行的线程，避免重复/过期）
        setLineComments(prev => {
          const filtered: Record<string, LineCommentData> = {};
          Object.keys(prev).forEach(k => {
            if (!k.startsWith(`${filePath}:`) && prev[k]) {
              filtered[k] = prev[k];
            }
          });
          return { ...filtered, ...commentsByLine };
        });
      } catch (e: any) {
        console.warn('加载评论失败:', e?.response?.data || e);
        setCommentsError(
          e?.response?.data?.message || e?.message || '加载评论失败'
        );
      }
    },
    [snapshotId]
  );

  // 加载文件内容
  const loadFileContent = useCallback(
    async (filePath: string) => {
      try {
        setLoadingFile(true);
        setFilePreviewUrl(prev => {
          if (prev) URL.revokeObjectURL(prev);
          return null;
        });
        setFileIsBinary(false);
        setFileMime(null);
        if (sourceMode === 'artifact') {
          // artifacts 接口返回 JSON：{ path, content, encoding }
          const resp = await apiClient.get<any>(getApiPath('file'), {
            params: { path: filePath },
          });
          const content = (resp.data as any)?.content as string | undefined;
          if (typeof content === 'string') {
            setFileContent(content);
            setFileIsBinary(false);
            setFileMime('text/plain');
          } else {
            setFileIsBinary(true);
          }
        } else {
          // snapshots 接口：按原逻辑支持文本/图片等
          const resp = await apiClient.get<ArrayBuffer>(getApiPath('file'), {
            params: { path: filePath },
            responseType: 'arraybuffer' as any,
          });
          const buf: ArrayBuffer = resp.data as any;
          const mime = (resp.headers?.['content-type'] as string) || '';
          setFileMime(mime || null);

          const u8 = new Uint8Array(buf);
          const hasNull = u8.some(b => b === 0);
          const isImage = mime.startsWith('image/');

          if (isImage) {
            const blob = new Blob([buf], { type: mime });
            const url = URL.createObjectURL(blob);
            setFilePreviewUrl(url);
            setFileIsBinary(true);
          } else if (
            !hasNull &&
            (mime.startsWith('text/') || mime === '' || mime.includes('json'))
          ) {
            const decoder = new TextDecoder('utf-8');
            const text = decoder.decode(u8);
            setFileContent(text);
            setFileIsBinary(false);
          } else {
            setFileIsBinary(true);
          }
        }

        setSelectedFile(filePath);
        await loadLineComments(filePath);
      } catch (e: any) {
        // eslint-disable-next-line no-console
        console.warn('加载文件内容失败:', e?.response?.data || e);
        setFileError(e?.message || '加载文件内容失败');
      } finally {
        setLoadingFile(false);
      }
    },
    [getApiPath, loadLineComments, sourceMode]
  );

  // 加载指定目录的文件树
  const loadFileTree = useCallback(
    async (path: string = '') => {
      try {
        setLoading(true);
        setTreeError(null);
        const { data } = await apiClient.get<FileTreeNode[]>(
          getApiPath('tree'),
          {
            params: path ? { path } : {},
          }
        );
        setFileTree(data);
        setCurrentPath(path);
        setHasLoadedOnce(true);

        if (
          path === '' &&
          !selectedFileRef.current &&
          !initialFileFromUrl &&
          Array.isArray(data)
        ) {
          const names = data.map(n => n.name.toLowerCase());
          const pick = (candidates: string[]): string | null => {
            for (const c of candidates) {
              const idx = names.indexOf(c.toLowerCase());
              if (idx !== -1 && data[idx]?.type === 'file') {
                return data[idx].name;
              }
            }
            return null;
          };

          const readme = data.find(
            n => n.type === 'file' && /^readme(\..+)?$/i.test(n.name)
          )?.name;
          const preferred =
            readme ||
            pick([
              'readme.md',
              'readme',
              'readme.txt',
              'index.md',
              'index.ts',
              'index.tsx',
              'index.js',
              'package.json',
            ]) ||
            (data.find(n => n.type === 'file')?.name ?? null);

          if (preferred) {
            void loadFileContent(preferred);
          }
        }
      } catch (e: any) {
        const msg = e?.message || '加载文件树失败';
        const code = e?.code ?? e?.status ?? e?.response?.status;
        // 回退到基础快照（artifact）
        const shouldFallback =
          code === 'NOT_FOUND' ||
          code === 404 ||
          /不存在|not\s*found/i.test(msg);
        if (shouldFallback) {
          try {
            const { data: snap } = await apiClient.get<any>(
              `/snapshots/${snapshotId}`
            );
            const baseId =
              (snap as any)?.baseSnapshotId || (snap as any)?.baseSnapshot?.id;
            if (baseId) {
              const { data: tree } = await apiClient.get<FileTreeNode[]>(
                `/artifacts/${baseId}/tree`,
                { params: path ? { path } : {} }
              );
              setSourceMode('artifact');
              setArtifactId(baseId);
              setFileTree(tree);
              setCurrentPath(path);
              setHasLoadedOnce(true);
              setTreeError(null);
              setCanRecover(false);
              // 自动选择默认文件
              if (
                path === '' &&
                !selectedFileRef.current &&
                !initialFileFromUrl &&
                Array.isArray(tree)
              ) {
                const names = tree.map(n => n.name.toLowerCase());
                const pick = (candidates: string[]): string | null => {
                  for (const c of candidates) {
                    const idx = names.indexOf(c.toLowerCase());
                    if (idx !== -1 && tree[idx]?.type === 'file')
                      return tree[idx].name;
                  }
                  return null;
                };
                const readme = tree.find(
                  n => n.type === 'file' && /^readme(\..+)?$/i.test(n.name)
                )?.name;
                const preferred =
                  readme ||
                  pick([
                    'readme.md',
                    'readme',
                    'index.md',
                    'index.ts',
                    'index.tsx',
                    'index.js',
                    'package.json',
                  ]) ||
                  (tree.find(n => n.type === 'file')?.name ?? null);
                if (preferred) void loadFileContent(preferred);
              }
              return;
            }
          } catch (fe) {
            // 回退失败，走原错误处理
          }
        }
        setTreeError(msg);
        if (shouldFallback) {
          setCanRecover(true);
          try {
            onInvalid?.();
          } catch {}
        }
      } finally {
        setLoading(false);
      }
    },
    [getApiPath, loadFileContent, onInvalid, snapshotId, initialFileFromUrl]
  );

  useEffect(() => {
    void loadFileTree('');
  }, [loadFileTree]);

  // URL 深链锚点：/snapshots/:id?file=...&line=...
  useEffect(() => {
    if (handledAnchor) return;
    try {
      const file = searchParams?.get('file');
      const lineStr = searchParams?.get('line');
      const line = lineStr ? parseInt(lineStr, 10) : NaN;
      if (file && Number.isFinite(line) && line > 0) {
        (async () => {
          try {
            await loadFileContent(file);
          } finally {
            const key = `${file}:${line}`;
            setExpandedLineKeys(prev => {
              const s = new Set(prev);
              s.add(key);
              return s;
            });
            setHandledAnchor(true);
          }
        })();
      }
    } catch {
      // ignore
    }
  }, [searchParams, handledAnchor, loadFileContent]);
  // 登录回流：展开对应行的内嵌评论区（TTL 10 分钟 + 兜底清理）
  useEffect(() => {
    const KEY = 'RG_POST_LOGIN';
    try {
      const raw =
        typeof window !== 'undefined' ? localStorage.getItem(KEY) : null;
      if (!raw) return;

      let payload: any = null;
      try {
        payload = JSON.parse(raw);
      } catch {
        try {
          localStorage.removeItem(KEY);
        } catch {}
        return;
      }

      const now = Date.now();
      const ttlMs = 10 * 60 * 1000;
      const ts = typeof payload?.ts === 'number' ? payload.ts : 0;
      const isExpired = now - ts > ttlMs;

      const valid =
        payload?.action === 'openLineComments' &&
        payload?.snapshotId === snapshotId &&
        typeof payload?.filePath === 'string' &&
        typeof payload?.lineNumber === 'number' &&
        payload?.lineNumber > 0 &&
        !isExpired;

      if (!valid) {
        try {
          localStorage.removeItem(KEY);
        } catch {}
        return;
      }

      (async () => {
        try {
          await loadFileContent(payload.filePath);
        } finally {
          const key = `${payload.filePath}:${payload.lineNumber}`;
          setExpandedLineKeys(prev => {
            const s = new Set(prev);
            s.add(key);
            return s;
          });
          try {
            localStorage.removeItem(KEY);
          } catch {}
        }
      })();
    } catch {
      try {
        localStorage.removeItem('RG_POST_LOGIN');
      } catch {}
    }
  }, [snapshotId, loadFileContent]);

  // 返回上级目录
  const goToParentDirectory = useCallback(() => {
    const parentPath = currentPath.includes('/')
      ? currentPath.substring(0, currentPath.lastIndexOf('/'))
      : '';
    void loadFileTree(parentPath);
  }, [currentPath, loadFileTree]);

  // 处理查看行级评论
  // 点击某行的“查看评论”：折叠/展开该行内嵌评论区
  const handleViewLineComments = useCallback(
    (filePath: string, lineNumber: number) => {
      const key = `${filePath}:${lineNumber}`;
      setExpandedLineKeys(prev => {
        const s = new Set(prev);
        if (s.has(key)) s.delete(key);
        else s.add(key);
        return s;
      });
      // 确保有线程容器
      setLineComments(prev => {
        if (prev[key]) return prev;
        return { ...prev, [key]: { filePath, lineNumber, comments: [] } };
      });
    },
    []
  );

  // 构建当前文件的完整路径
  const getFullPath = useCallback(
    (fileName: string) => {
      return currentPath ? `${currentPath}/${fileName}` : fileName;
    },
    [currentPath]
  );

  // 渲染文件树节点
  const renderFileTreeNode = useCallback(
    (node: FileTreeNode) => {
      const fullPath = getFullPath(node.name);
      const isSelected = selectedFile === fullPath;

      return (
        <div key={node.name}>
          <div
            className={`flex items-center gap-2 py-1 px-2 rounded-md transition-colors cursor-pointer ${
              isSelected
                ? 'bg-accent text-accent-foreground shadow-sm'
                : 'hover:bg-[color:var(--code-line-hover)] text-foreground/80'
            }`}
            onClick={() => {
              if (node.type === 'dir') {
                void loadFileTree(fullPath);
              } else {
                void loadFileContent(fullPath);
              }
            }}
          >
            {node.type === 'dir' ? (
              <SetiFolderIcon className="h-4 w-4" aria-label="文件夹" />
            ) : (
              <SetiFileIcon
                fileName={node.name}
                className="h-4 w-4"
                aria-label="文件"
              />
            )}
            <span className="text-sm flex-1 truncate">{node.name}</span>
          </div>
        </div>
      );
    },
    [selectedFile, loadFileTree, loadFileContent, getFullPath]
  );

  // 渲染代码内容，每行后面添加查看评论按钮
  const renderCodeContent = useMemo(() => {
    if (!fileContent || !selectedFile) return null;

    const contentStr =
      typeof fileContent === 'string' ? fileContent : String(fileContent ?? '');
    const lines = contentStr.split('\n');

    return (
      <div
        className="font-mono min-h-full"
        style={{ fontSize: `${Math.round(13 * codeZoom)}px` }}
      >
        {lines.map((line, index) => {
          const lineNumber = index + 1;
          const commentKey = `${selectedFile}:${lineNumber}`;
          const thread = lineComments[commentKey];
          const totalCount = thread
            ? thread.comments.reduce(
                (sum, c) => sum + 1 + (c.replies?.length ?? 0),
                0
              )
            : 0;

          return (
            <div key={lineNumber} className="border-b last:border-b-0">
              <div className="flex group hover:bg-[color:var(--code-line-hover)] transition-colors">
                {/* 行号 */}
                <div
                  className="flex-shrink-0 w-12 text-right pr-4 py-1 border-r select-none"
                  style={{
                    color: 'var(--code-line-number)',
                    backgroundColor: 'var(--code-line-gutter-bg)',
                    borderColor: 'var(--code-line-border)',
                  }}
                >
                  {lineNumber}
                </div>

                {/* 代码内容 */}
                <div className="flex-1 min-w-0 px-4 py-1 whitespace-pre-wrap break-words text-[color:var(--code-text)]">
                  {highlightedLines ? (
                    <span
                      dangerouslySetInnerHTML={{
                        __html: highlightedLines[index] || line || ' ',
                      }}
                    />
                  ) : (
                    <>{line || ' '}</>
                  )}
                </div>

                {/* 查看评论按钮 */}
                <div className="flex-shrink-0 px-2 py-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`opacity-0 group-hover:opacity-100 transition-opacity h-6 px-2 text-xs text-[color:var(--code-accent)] ${
                      totalCount > 0 ? 'opacity-100 font-medium' : ''
                    }`}
                    onClick={() =>
                      handleViewLineComments(selectedFile, lineNumber)
                    }
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    {totalCount > 0 ? `查看评论(${totalCount})` : '查看评论'}
                  </Button>
                </div>
              </div>

              {expandedLineKeys.has(commentKey) && (
                <div className="flex">
                  {/* 左侧 gutter：保持与代码行号列一致，提供竖线且不被评论遮挡 */}
                  <div
                    className="flex-shrink-0 w-12 pr-4 border-r"
                    style={{
                      backgroundColor: 'var(--code-line-gutter-bg)',
                      borderColor: 'var(--code-line-border)',
                    }}
                    aria-hidden="true"
                  />
                  {/* 右侧评论容器：与代码内容区相同的左内边距 px-4，保证左边界对齐 */}
                  <div className="flex-1 min-w-0 px-4 py-2 bg-muted/30">
                    <LineCommentInlinePanel
                      data={
                        thread ?? {
                          filePath: selectedFile,
                          lineNumber,
                          comments: [],
                        }
                      }
                      snapshotId={snapshotId}
                      commitSha={commitSha}
                      highlightCommentId={highlightCommentId}
                      onUpdate={updated => {
                        setLineComments(prev => ({
                          ...prev,
                          [commentKey]: updated,
                        }));
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }, [
    fileContent,
    selectedFile,
    lineComments,
    expandedLineKeys,
    handleViewLineComments,
    snapshotId,
    commitSha,
    highlightedLines,
    codeZoom,
    highlightCommentId,
  ]);

  if (!hasLoadedOnce && loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingHint
          message={'加载文件树中...'}
          withSpinner
          className="text-base"
          iconClassName="h-5 w-5"
        />
      </div>
    );
  }

  if (!hasLoadedOnce && treeError) {
    return (
      <div className="p-4">
        <FeedbackBanner
          variant="error"
          message={<>目录加载失败：{treeError}</>}
          retryLabel="重试"
          onRetry={() => void loadFileTree('')}
        />
        {canRecover && onRecover && (
          <div className="mt-3">
            <Button size="sm" variant="soft" onClick={onRecover}>
              重新创建会话
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative flex min-h-[900px] border rounded-lg ${className}`}
    >
      {/* 左侧文件树 */}
      <div className="w-80 border-r bg-muted/20 overflow-auto h-full">
        <div
          className="p-4 border-b bg-background/95 backdrop-blur-md sticky top-0 z-20 shadow-md border-border/50"
          onClick={e => e.stopPropagation()}
          onMouseDown={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">文件浏览</h3>
            {currentPath && (
              <Button
                variant="outline-subtle"
                size="sm"
                onClick={goToParentDirectory}
                className="h-6 px-2 text-xs"
              >
                ← 上级
              </Button>
            )}
          </div>
          {currentPath && (
            <div className="text-xs text-muted-foreground mt-1 truncate">
              {currentPath}
            </div>
          )}
        </div>
        <div className="p-2">
          {treeError ? (
            <FeedbackBanner
              variant="error"
              message={<>目录加载失败：{treeError}</>}
              retryLabel="重试"
              onRetry={() => void loadFileTree(currentPath)}
              className="text-sm"
            />
          ) : loading ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-4 bg-muted/50 rounded animate-pulse"
                />
              ))}
            </div>
          ) : (
            fileTree.map(node => renderFileTreeNode(node))
          )}
          {treeError && canRecover && onRecover && (
            <div className="mt-3">
              <Button
                size="sm"
                variant="soft"
                onClick={onRecover}
                className="w-full"
              >
                重新创建会话
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 右侧代码内容 */}
      <div className="flex-1 flex flex-col overflow-hidden h-full">
        {selectedFile ? (
          <div className="flex flex-col h-full">
            <div
              className="p-4 border-b bg-background/50 backdrop-blur-sm sticky top-0 z-30 shadow-md border-border/50"
              onClick={e => e.stopPropagation()}
              onMouseDown={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-medium truncate">{selectedFile}</h4>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline-subtle"
                    onClick={() =>
                      setCodeZoom(z => Math.min(2.5, +(z + 0.125).toFixed(3)))
                    }
                    className="h-7 px-2"
                    title="放大代码"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-subtle"
                    onClick={() =>
                      setCodeZoom(z => Math.max(0.5, +(z - 0.125).toFixed(3)))
                    }
                    className="h-7 px-2"
                    title="缩小代码"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-subtle"
                    onClick={() => setCodeZoom(DEFAULT_ZOOM)}
                    className="h-7 px-2"
                    title="重置缩放"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-auto" ref={codeContainerRef}>
              <div className="space-y-4 pb-6">
                {commentsError && (
                  <FeedbackBanner
                    variant="error"
                    message={<>行级评论加载失败：{commentsError}</>}
                    retryLabel="重试加载评论"
                    onRetry={() =>
                      selectedFile && void loadLineComments(selectedFile)
                    }
                    className="mx-3 text-sm"
                  />
                )}

                {fileError && (
                  <FeedbackBanner
                    variant="error"
                    message={<>文件加载失败：{fileError}</>}
                    retryLabel="重试加载文件"
                    onRetry={() =>
                      selectedFile && void loadFileContent(selectedFile)
                    }
                    className="mx-3 text-sm"
                  />
                )}

                {fileIsBinary ? (
                  <div className="p-4">
                    {filePreviewUrl && fileMime?.startsWith('image/') ? (
                      <div
                        ref={imgContainerRef}
                        className="relative border rounded bg-background overflow-auto max-h-[70vh]"
                      >
                        <div className="absolute top-2 right-2 z-10 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline-subtle"
                            onClick={() =>
                              setImgZoom(z => Math.min(5, z + 0.25))
                            }
                            className="h-7 px-2"
                            title="放大"
                          >
                            <ZoomIn className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-subtle"
                            onClick={() =>
                              setImgZoom(z => Math.max(0.25, z - 0.25))
                            }
                            className="h-7 px-2"
                            title="缩小"
                          >
                            <ZoomOut className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-subtle"
                            onClick={() => setImgZoom(1)}
                            className="h-7 px-2"
                            title="重置"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-subtle"
                            onClick={() => {
                              const el = imgContainerRef.current;
                              if (!el) return;
                              if (document.fullscreenElement) {
                                void document.exitFullscreen().catch(() => {});
                              } else {
                                // @ts-ignore
                                void el.requestFullscreen?.();
                              }
                            }}
                            className="h-7 px-2"
                            title="全屏预览"
                          >
                            <Maximize2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <img
                          src={filePreviewUrl}
                          alt={selectedFile}
                          className="max-w-full h-auto select-none"
                          style={{
                            transform: `scale(${imgZoom})`,
                            transformOrigin: 'top left',
                          }}
                          onDoubleClick={() =>
                            setImgZoom(z => (z === 1 ? 2 : 1))
                          }
                        />
                      </div>
                    ) : (
                      <div className="text-center text-sm text-muted-foreground">
                        <p>该文件为二进制类型，暂不支持在线预览。</p>
                        <div className="mt-3">
                          <Button
                            variant="outline-subtle"
                            size="sm"
                            onClick={async () => {
                              try {
                                const resp = await apiClient.get<ArrayBuffer>(
                                  getApiPath('file'),
                                  {
                                    params: { path: selectedFile },
                                    responseType: 'arraybuffer' as any,
                                  }
                                );
                                const ct =
                                  (resp.headers?.['content-type'] as string) ||
                                  'application/octet-stream';
                                const blob = new Blob([resp.data as any], {
                                  type: ct,
                                });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download =
                                  selectedFile.split('/').pop() || 'download';
                                a.click();
                                URL.revokeObjectURL(url);
                              } catch (e) {
                                // ignore
                              }
                            }}
                          >
                            下载文件
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    ref={codeContainerRef}
                    className="relative outline-none"
                    tabIndex={0}
                    onWheel={handleCodeWheel}
                    onKeyDown={handleCodeKeyDown}
                    style={{ fontSize: `${Math.round(13 * codeZoom)}px` }}
                  >
                    {renderCodeContent}
                    {loadingFile && (
                      <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex items-center justify-center">
                        <LoadingHint
                          message={'加载文件内容中...'}
                          withSpinner
                          className="text-base"
                          iconClassName="h-5 w-5"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">请选择文件</h3>
              <p className="text-muted-foreground">
                在左侧选择一个文件以查看内容与评论
              </p>
            </div>
          </div>
        )}
      </div>

      <Button
        type="button"
        size="icon"
        className="fixed bottom-20 right-[clamp(3.5rem,6vw,5rem)] h-14 w-14 rounded-full shadow-lg z-50"
        variant="secondary"
        onClick={handleScrollToTop}
      >
        <ArrowUp className="h-6 w-6" />
      </Button>
    </div>
  );
}
