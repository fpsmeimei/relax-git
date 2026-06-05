import { cn } from '@/lib/utils';
import type { SVGProps } from 'react';

interface SetiFolderIconProps extends SVGProps<SVGSVGElement> {}

interface SetiFileIconProps extends SVGProps<SVGSVGElement> {
  fileName: string;
}

const EXACT_FILE_COLORS: Record<string, string> = {
  'package.json': 'var(--seti-file-node)',
  'package-lock.json': 'var(--seti-file-node)',
  'pnpm-lock.yaml': 'var(--seti-file-node)',
  'yarn.lock': 'var(--seti-file-node)',
  dockerfile: 'var(--seti-file-docker)',
  makefile: 'var(--seti-file-make)',
  'readme.md': 'var(--seti-file-markdown)',
};

const EXTENSION_COLORS: Record<string, string> = {
  js: 'var(--seti-file-js)',
  jsx: 'var(--seti-file-react)',
  ts: 'var(--seti-file-ts)',
  tsx: 'var(--seti-file-react)',
  json: 'var(--seti-file-json)',
  md: 'var(--seti-file-markdown)',
  mdx: 'var(--seti-file-markdown)',
  css: 'var(--seti-file-css)',
  scss: 'var(--seti-file-css)',
  less: 'var(--seti-file-css)',
  html: 'var(--seti-file-html)',
  htm: 'var(--seti-file-html)',
  svg: 'var(--seti-file-asset)',
  png: 'var(--seti-file-asset)',
  jpg: 'var(--seti-file-asset)',
  jpeg: 'var(--seti-file-asset)',
  gif: 'var(--seti-file-asset)',
  webp: 'var(--seti-file-asset)',
  bmp: 'var(--seti-file-asset)',
  ico: 'var(--seti-file-asset)',
  go: 'var(--seti-file-go)',
  py: 'var(--seti-file-python)',
  rb: 'var(--seti-file-ruby)',
  java: 'var(--seti-file-java)',
  kt: 'var(--seti-file-java)',
  c: 'var(--seti-file-c)',
  cc: 'var(--seti-file-c)',
  cpp: 'var(--seti-file-c)',
  h: 'var(--seti-file-c)',
  cs: 'var(--seti-file-csharp)',
  php: 'var(--seti-file-php)',
  sql: 'var(--seti-file-sql)',
  sh: 'var(--seti-file-shell)',
  bash: 'var(--seti-file-shell)',
  ps1: 'var(--seti-file-shell)',
  yaml: 'var(--seti-file-yml)',
  yml: 'var(--seti-file-yml)',
  env: 'var(--seti-file-env)',
  lock: 'var(--seti-file-lock)',
  conf: 'var(--seti-file-config)',
  toml: 'var(--seti-file-config)',
  ini: 'var(--seti-file-config)',
  cfg: 'var(--seti-file-config)',
};

const DEFAULT_FILE_COLOR = 'var(--seti-file-default)';

export function SetiFolderIcon({
  className,
  style,
  ...rest
}: SetiFolderIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn('shrink-0 text-[color:var(--seti-folder)]', className)}
      style={style}
      {...rest}
    >
      <path
        fill="currentColor"
        d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"
      />
    </svg>
  );
}

export function SetiFileIcon({
  fileName,
  className,
  style,
  ...rest
}: SetiFileIconProps) {
  const lowerName = fileName.toLowerCase();
  const ext = lowerName.includes('.') ? (lowerName.split('.').pop() ?? '') : '';
  const color =
    EXACT_FILE_COLORS[lowerName] ??
    (ext ? EXTENSION_COLORS[ext] : undefined) ??
    DEFAULT_FILE_COLOR;

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn(
        'shrink-0 text-[color:var(--seti-file-default)]',
        className
      )}
      style={{ color, ...style }}
      {...rest}
    >
      <path
        fill="currentColor"
        d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"
      />
    </svg>
  );
}
