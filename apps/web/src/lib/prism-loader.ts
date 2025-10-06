// 按需加载 Prism.js 以优化性能
let prismLoaded = false;
let prismPromise: Promise<typeof import('prismjs')> | null = null;

export async function loadPrism() {
  if (prismLoaded) {
    return (await import('prismjs')).default;
  }

  if (!prismPromise) {
    prismPromise = import('prismjs').then(async prism => {
      // 动态加载常用语言支持（使用 any 类型避免类型错误）
      await Promise.all([
        import('prismjs/components/prism-javascript' as any),
        import('prismjs/components/prism-typescript' as any),
        import('prismjs/components/prism-jsx' as any),
        import('prismjs/components/prism-tsx' as any),
        import('prismjs/components/prism-css' as any),
        import('prismjs/components/prism-json' as any),
        import('prismjs/components/prism-markdown' as any),
        import('prismjs/components/prism-bash' as any),
        import('prismjs/components/prism-python' as any),
        import('prismjs/components/prism-java' as any),
        import('prismjs/components/prism-go' as any),
        import('prismjs/components/prism-rust' as any),
      ]).catch(() => {
        // 忽略加载失败的语言
      });

      prismLoaded = true;
      return prism.default;
    });
  }

  return prismPromise;
}

// 获取文件扩展名对应的 Prism 语言
export function getLanguageFromExtension(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();

  const languageMap: Record<string, string> = {
    js: 'javascript',
    jsx: 'jsx',
    ts: 'typescript',
    tsx: 'tsx',
    py: 'python',
    java: 'java',
    go: 'go',
    rs: 'rust',
    css: 'css',
    scss: 'scss',
    sass: 'sass',
    html: 'html',
    xml: 'xml',
    json: 'json',
    md: 'markdown',
    yml: 'yaml',
    yaml: 'yaml',
    sh: 'bash',
    bash: 'bash',
    zsh: 'bash',
    fish: 'bash',
    sql: 'sql',
    php: 'php',
    rb: 'ruby',
    c: 'c',
    cpp: 'cpp',
    cs: 'csharp',
    kt: 'kotlin',
    swift: 'swift',
    dart: 'dart',
  };

  return languageMap[ext || ''] || 'text';
}
