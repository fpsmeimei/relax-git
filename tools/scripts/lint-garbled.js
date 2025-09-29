#!/usr/bin/env node
/*
  lint-garbled.js
  - 扫描源码中的可见“乱码”痕迹：
    1) 连续三个及以上的问号：/\?{3,}/
    2) Unicode Replacement Character：\uFFFD （�）
    3) 明显控制字符（除 \t\n\r 之外的 C0 控制符）
  - 默认扫描 apps/web/src；也可传入要扫描的目录参数
  - 退出码：
    0 -> 未发现；
    2 -> 发现疑似乱码；
*/

const fs = require('fs');
const path = require('path');

const IGNORES = new Set([
  'node_modules',
  '.next',
  'dist',
  'build',
  'coverage',
  '.turbo',
  '.git',
]);

const EXTS = new Set(['.ts', '.tsx', '.js', '.jsx', '.css', '.json']);

const ROOT = process.cwd();
const target = process.argv[2] || 'apps/web/src';
const startDir = path.resolve(ROOT, target);

/** 控制字符（除 \t\n\r） */
const ctrlCharRegex = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/;
const manyQRegex = /\?{3,}/; // 连续 3 个及以上问号
const replacementCharRegex = /\uFFFD|�/;

let issues = [];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    if (IGNORES.has(ent.name)) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      walk(full);
    } else {
      const ext = path.extname(ent.name);
      if (!EXTS.has(ext)) continue;
      scanFile(full);
    }
  }
}

function scanFile(file) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split(/\r?\n/);
  let inBlock = false;
  for (let i = 0; i < lines.length; i++) {
    let raw = lines[i];
    let line = raw;

    // 处理跨行块注释
    if (inBlock) {
      const end = line.indexOf('*/');
      if (end >= 0) {
        line = line.slice(end + 2);
        inBlock = false;
      } else {
        continue; // 整行在块注释中
      }
    }
    const start = line.indexOf('/*');
    if (start >= 0) {
      const end = line.indexOf('*/', start + 2);
      if (end >= 0) {
        line = line.slice(0, start) + line.slice(end + 2);
      } else {
        line = line.slice(0, start);
        inBlock = true;
      }
    }

    // 去除行内 // 注释再检查
    const slashes = line.indexOf('//');
    if (slashes >= 0) {
      line = line.slice(0, slashes);
    }

    const trimmed = line.trim();
    if (!trimmed) continue; // 空行或仅注释

    const hasManyQ = manyQRegex.test(line);
    const hasRepl = replacementCharRegex.test(line);
    const hasCtrl = ctrlCharRegex.test(line);

    if (hasManyQ || hasRepl || hasCtrl) {
      issues.push({ file, line: i + 1, text: raw.slice(0, 200) });
    }
  }
}

if (!fs.existsSync(startDir)) {
  console.error(`[lint-garbled] 路径不存在: ${startDir}`);
  process.exit(1);
}

walk(startDir);

if (issues.length > 0) {
  console.error(`\n[lint-garbled] 发现疑似乱码 ${issues.length} 处`);
  for (const it of issues) {
    console.error(`- ${path.relative(ROOT, it.file)}:${it.line}: ${it.text}`);
  }
  process.exit(2);
} else {
  console.log('[lint-garbled] 未发现可疑乱码');
  process.exit(0);
}
