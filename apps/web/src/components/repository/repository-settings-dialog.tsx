"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Cropper from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/services/apiClient";
import { toast } from "@/hooks/use-toast";

export type RepoVisibility = "PUBLIC" | "INTERNAL" | "PRIVATE";

export interface RepositoryForSettings {
  id: string;
  name: string;
  description?: string | null;
  visibility: RepoVisibility;
  coverImage?: string | null;
  isPublished?: boolean;
  publishedAt?: string | null;
}

interface Props {
  open: boolean;
  repo: RepositoryForSettings;
  onClose: () => void;
  onUpdated?: (repo: Partial<RepositoryForSettings> & { id: string }) => void;
}

export default function RepositorySettingsDialog({ open, repo, onClose, onUpdated }: Props) {
  // 基本信息
  const [name, setName] = useState(repo.name);
  const [description, setDescription] = useState<string>(repo.description ?? "");
  const [visibility, setVisibility] = useState<RepoVisibility>(repo.visibility);
  const [isPublished, setIsPublished] = useState<boolean>(!!repo.isPublished);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // 打开时同步最新 props
    if (open) {
      setName(repo.name);
      setDescription(repo.description ?? "");
      setVisibility(repo.visibility);
      setIsPublished(!!repo.isPublished);
    }
  }, [open, repo]);

  // 封面上传（参考个人头像）
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const coverUrl = useMemo(() => repo.coverImage ?? null, [repo.coverImage]);

  const handleSelectedFile = useCallback((f: File) => {
    const okTypes = ["image/png", "image/jpeg", "image/webp"];
    if (!okTypes.includes(f.type)) {
      toast({ title: "不支持的图片类型", description: "仅支持 PNG / JPEG / WEBP", variant: "destructive" });
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast({ title: "图片较大", description: "将自动压缩导出以满足 2MB 限制" });
    }
    setFile(f);
    const obj = URL.createObjectURL(f);
    setImageSrc(prev => {
      if (prev) URL.revokeObjectURL(prev);
      return obj;
    });
    setZoom(1);
    setCrop({ x: 0, y: 0 });
    setCroppedAreaPixels(null);
  }, []);

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    handleSelectedFile(f);
    e.currentTarget.value = "";
  }, [handleSelectedFile]);

  useEffect(() => () => { if (imageSrc) URL.revokeObjectURL(imageSrc); }, [imageSrc]);

  const onCropComplete = useCallback((_: any, areaPixels: { x: number; y: number; width: number; height: number }) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  async function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = document.createElement("img");
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  async function getCroppedBlob(
    src: string,
    pixelArea: { x: number; y: number; width: number; height: number },
    mime: "image/jpeg" | "image/png" | "image/webp" = "image/jpeg"
  ): Promise<Blob> {
    const image = await loadImage(src);
    const canvas = document.createElement("canvas");
    const maxSize = 1024; // 封面可更大一些
    const scale = Math.min(maxSize / pixelArea.width, maxSize / pixelArea.height, 1);
    const targetW = Math.round(pixelArea.width * scale);
    const targetH = Math.round(pixelArea.height * scale);
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 不可用");
    ctx.drawImage(image, pixelArea.x, pixelArea.y, pixelArea.width, pixelArea.height, 0, 0, targetW, targetH);
    const supportsQuality = mime === "image/jpeg" || mime === "image/webp";
    const qualities = supportsQuality ? [0.92, 0.8, 0.7, 0.6] : [1];
    for (const q of qualities) {
      const blob: Blob = await new Promise(resolve => canvas.toBlob(b => resolve(b as Blob), mime, q));
      if (blob.size <= 2 * 1024 * 1024 || q === qualities[qualities.length - 1]) return blob;
    }
    const fallback = await new Promise<Blob>(resolve => canvas.toBlob(b => resolve(b as Blob)));
    return fallback;
  }

  // 保存基本信息
  const doSave = async () => {
    if (!name || name.length < 1) {
      toast({ title: "仓库名不能为空", variant: "warning" });
      return;
    }
    try {
      setSaving(true);
      const { data } = await apiClient.patch(`/repositories/${repo.id}`, {
        name,
        description,
        visibility,
        isPublished,
      });
      onUpdated?.({ id: repo.id, name: (data as any)?.name, description: (data as any)?.description, visibility: (data as any)?.visibility, isPublished: (data as any)?.isPublished, publishedAt: (data as any)?.publishedAt });
      toast({ title: "已保存" });
    } catch (e: any) {
      // 错误提示已在拦截器处理
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    try {
      await apiClient.delete(`/repositories/${repo.id}`);
      toast({ title: '仓库已删除' });
      onUpdated?.({ id: repo.id, ...( { deleted: true } as any) });
      setConfirmOpen(false);
      onClose();
    } catch (e: any) {
      // 错误提示由拦截器处理
    }
  };

  // 上传封面
  const doUploadCover = async () => {
    if (!file || !imageSrc || !croppedAreaPixels) {
      toast({ title: "请先选择并裁剪图片", variant: "warning" });
      return;
    }
    try {
      setUploading(true);
      const preferredType = (file.type as any) as "image/png" | "image/jpeg" | "image/webp";
      const exportType: any = ["image/png", "image/webp", "image/jpeg"].includes(preferredType) ? preferredType : "image/jpeg";
      const blob = await getCroppedBlob(imageSrc, croppedAreaPixels, exportType);
      const ext = exportType === "image/png" ? "png" : exportType === "image/webp" ? "webp" : "jpg";
      const uploadFile = new File([blob], `cover.${ext}`, { type: exportType });
      const fd = new FormData();
      fd.append("file", uploadFile);
      const { data } = await apiClient.post(`/repositories/${repo.id}/cover`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onUpdated?.({ id: repo.id, coverImage: (data as any)?.coverImage });
      toast({ title: "封面已更新" });
      // 清理状态
      setFile(null);
      setImageSrc(prev => { if (prev) URL.revokeObjectURL(prev); return null; });
      setCroppedAreaPixels(null);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
    } catch (e: any) {
      // 统一错误提示由拦截器处理
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent onClose={onClose} className="max-w-5xl p-8 border-0 sm:rounded-2xl shadow-2xl">
        <DialogHeader>
          <DialogTitle>仓库设置</DialogTitle>
          <DialogDescription>编辑仓库基本信息、可见性、发布状态与社区封面</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* 基本信息 */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="repo-name">仓库名称</Label>
              <Input id="repo-name" value={name} onChange={e => setName(e.target.value)} placeholder="仓库名称（ID 不可更改，仅名称可改）" />
              <p className="text-xs text-muted-foreground mt-1">仓库 ID 唯一且不可变更，此处仅修改显示名称。</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="repo-desc">仓库描述</Label>
              <Textarea id="repo-desc" value={description} onChange={e => setDescription(e.target.value)} placeholder="为仓库添加一句话简介" />
            </div>
            <div className="space-y-2">
              <Label>仓库可见性</Label>
              <Select value={visibility} onValueChange={v => setVisibility(v as RepoVisibility)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="选择可见性" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUBLIC">公开（所有人可见，可互动）</SelectItem>
                  <SelectItem value="INTERNAL">公开只读（所有人可见，互动受限，仅成员/Owner可评）</SelectItem>
                  <SelectItem value="PRIVATE">私有（仅成员可见）</SelectItem>
                </SelectContent>
              </Select>
              <ul className="text-xs text-muted-foreground mt-2 space-y-1 list-disc pl-4">
                <li><b>全部公开</b>：所有人可见，可在社区被推荐与互动。</li>
                <li><b>仅可查看</b>：所有人可见，但评论与互动权限受限（仅成员/Owner）。</li>
                <li><b>私有</b>：仅仓库成员可见，其他人无法访问。</li>
              </ul>
            </div>
            <div className="flex items-center justify-between bg-muted/10 rounded-lg p-4">
              <div className="mr-4">
                <Label htmlFor="publish-toggle">发布到社区</Label>
                <p className="text-xs text-muted-foreground mt-1">开启后，符合条件（公开或只读）的仓库会出现在“社区”中。</p>
                {repo.publishedAt && (
                  <p className="text-xs text-muted-foreground mt-1">首次发布于：{new Date(repo.publishedAt).toLocaleString()}</p>
                )}
              </div>
              <button
                id="publish-toggle"
                role="switch"
                aria-checked={isPublished}
                onClick={() => setIsPublished(v => !v)}
                className={cn(
                  "relative inline-flex h-7 w-12 items-center rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isPublished ? "bg-primary" : "bg-muted"
                )}
                aria-label={isPublished ? '已发布' : '未发布'}
              >
                <span
                  className={cn(
                    "inline-block h-5 w-5 transform rounded-full bg-background shadow transition-transform",
                    isPublished ? "translate-x-6" : "translate-x-1"
                  )}
                />
              </button>
            </div>
            <div className="flex items-center justify-between gap-3 pt-3">
              <div className="flex gap-3">
                <Button onClick={doSave} disabled={saving} variant="default">{saving ? "保存中…" : "保存基本信息"}</Button>
                <Button variant="outline-subtle" onClick={onClose}>关闭</Button>
              </div>
              <Button variant="destructive" onClick={() => setConfirmOpen(true)}>删除仓库</Button>
            </div>
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
              <DialogContent className="max-w-sm p-6" onClose={() => setConfirmOpen(false)}>
                <DialogHeader>
                  <DialogTitle>确认删除仓库？</DialogTitle>
                  <DialogDescription>删除后不可恢复，确定继续？</DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-2">
                  <Button variant="outline-subtle" onClick={() => setConfirmOpen(false)}>取消</Button>
                  <Button variant="destructive" onClick={doDelete}>确认删除</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* 社区封面 */}
          <div className="space-y-5">
            <Label>社区封面</Label>
            {/* 预览图：横向封面效果 */}
            <div className="relative w-full h-44 md:h-56 rounded-lg overflow-hidden bg-muted">
              {coverUrl ? (
                <Image src={coverUrl} alt="cover" fill sizes="640px" className="object-cover" unoptimized />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground">暂无封面</div>
              )}
            </div>

            <Separator className="my-2" />

            {/* 下方正方形选择/裁剪区域：左右与上方预览对齐（填满整列宽度） */}
            <div className="space-y-3 flex flex-col items-stretch">
              <div
                className={cn(
                  "relative w-full aspect-[16/9] rounded-2xl border border-dashed bg-muted/10 overflow-hidden",
                  !imageSrc ? "cursor-pointer" : "cursor-default"
                )}
                onClick={!imageSrc ? () => inputRef.current?.click() : undefined}
              >
                {imageSrc ? (
                  <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={16 / 9}
                    cropShape="rect"
                    showGrid={false}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                    objectFit="cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground">点击选择图片（16:9）</div>
                )}
                <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={onFileChange} />
              </div>

              {imageSrc && (
                <div className="flex items-center gap-3 w-full">
                  <span className="text-xs text-muted-foreground shrink-0">缩放</span>
                  <input type="range" min={1} max={3} step={0.05} value={zoom} onChange={(e: any) => setZoom(parseFloat(e.target.value))} className="w-full" />
                </div>
              )}

              {/* 行内对齐：右侧与左列“删除仓库”按钮平行 */}
              <div className="flex items-center justify-start gap-3 pt-3 w-full">
                {imageSrc && (
                  <Button variant="outline-subtle" onClick={() => {
                    setFile(null);
                    setImageSrc(prev => { if (prev) URL.revokeObjectURL(prev); return null; });
                    setCroppedAreaPixels(null);
                    setZoom(1);
                    setCrop({ x: 0, y: 0 });
                  }}>重置选择</Button>
                )}
                <Button onClick={doUploadCover} disabled={!imageSrc || uploading} variant="soft">{uploading ? "上传中…" : "上传封面"}</Button>
                <span className="text-xs text-muted-foreground whitespace-nowrap">支持 PNG / JPEG / WEBP，最大 2MB</span>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <div />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
