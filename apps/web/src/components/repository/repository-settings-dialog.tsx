'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Cropper from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiClient } from '@/services/apiClient';
import { toast } from '@/hooks/use-toast';

export type RepoVisibility = 'PUBLIC' | 'INTERNAL' | 'PRIVATE';

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

export default function RepositorySettingsDialog({
  open,
  repo,
  onClose,
  onUpdated,
}: Props) {
  // 基本信息
  const [name, setName] = useState(repo.name);
  const [description, setDescription] = useState<string>(
    repo.description ?? ''
  );
  const [visibility, setVisibility] = useState<RepoVisibility>(repo.visibility);
  const [isPublished, setIsPublished] = useState<boolean>(!!repo.isPublished);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // 打开时同步最新 props
    if (open) {
      setName(repo.name);
      setDescription(repo.description ?? '');
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

  const [currentCoverUrl, setCurrentCoverUrl] = useState<string | null>(
    repo.coverImage ?? null
  );

  useEffect(() => {
    setCurrentCoverUrl(repo.coverImage ?? null);
  }, [repo.coverImage]);

  const handleSelectedFile = useCallback((f: File) => {
    const okTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!okTypes.includes(f.type)) {
      toast({
        title: '不支持的图片类型',
        description: '仅支持 PNG / JPEG / WEBP',
        variant: 'destructive',
      });
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast({
        title: '图片较大',
        description: '将自动压缩导出以满足 2MB 限制',
      });
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

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (!f) return;
      handleSelectedFile(f);
      e.currentTarget.value = '';
    },
    [handleSelectedFile]
  );

  useEffect(
    () => () => {
      if (imageSrc) URL.revokeObjectURL(imageSrc);
    },
    [imageSrc]
  );

  const onCropComplete = useCallback(
    (
      _: any,
      areaPixels: { x: number; y: number; width: number; height: number }
    ) => {
      setCroppedAreaPixels(areaPixels);
    },
    []
  );

  async function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = document.createElement('img');
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  async function getCroppedBlob(
    src: string,
    pixelArea: { x: number; y: number; width: number; height: number },
    mime: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg'
  ): Promise<Blob> {
    const image = await loadImage(src);
    const canvas = document.createElement('canvas');
    const maxSize = 1024; // 封面可更大一些
    const scale = Math.min(
      maxSize / pixelArea.width,
      maxSize / pixelArea.height,
      1
    );
    const targetW = Math.round(pixelArea.width * scale);
    const targetH = Math.round(pixelArea.height * scale);
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 不可用');
    ctx.drawImage(
      image,
      pixelArea.x,
      pixelArea.y,
      pixelArea.width,
      pixelArea.height,
      0,
      0,
      targetW,
      targetH
    );
    const supportsQuality = mime === 'image/jpeg' || mime === 'image/webp';
    const qualities = supportsQuality ? [0.92, 0.8, 0.7, 0.6] : [1];
    for (const q of qualities) {
      const blob: Blob = await new Promise(resolve =>
        canvas.toBlob(b => resolve(b as Blob), mime, q)
      );
      if (blob.size <= 2 * 1024 * 1024 || q === qualities[qualities.length - 1])
        return blob;
    }
    const fallback = await new Promise<Blob>(resolve =>
      canvas.toBlob(b => resolve(b as Blob))
    );
    return fallback;
  }

  // 保存基本信息
  const doSave = async () => {
    if (!name || name.length < 1) {
      toast({ title: '仓库名不能为空', variant: 'warning' });
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
      onUpdated?.({
        id: repo.id,
        name: (data as any)?.name,
        description: (data as any)?.description,
        visibility: (data as any)?.visibility,
        isPublished: (data as any)?.isPublished,
        publishedAt: (data as any)?.publishedAt,
      });
      toast({
        title: '保存成功',
        description: '基本信息已更新，弹窗将自动关闭',
        variant: 'default',
      });
      // 延迟关闭弹窗
      setTimeout(() => {
        onClose();
      }, 1500);
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
      onUpdated?.({ id: repo.id, ...({ deleted: true } as any) });
      setConfirmOpen(false);
      onClose();
    } catch (e: any) {
      // 错误提示由拦截器处理
    }
  };

  // 上传封面
  const doUploadCover = async () => {
    if (!file || !imageSrc || !croppedAreaPixels) {
      toast({ title: '请先选择并裁剪图片', variant: 'warning' });
      return;
    }
    try {
      setUploading(true);
      const preferredType = file.type as any as
        | 'image/png'
        | 'image/jpeg'
        | 'image/webp';
      const exportType: any = [
        'image/png',
        'image/webp',
        'image/jpeg',
      ].includes(preferredType)
        ? preferredType
        : 'image/jpeg';
      const blob = await getCroppedBlob(
        imageSrc,
        croppedAreaPixels,
        exportType
      );
      const ext =
        exportType === 'image/png'
          ? 'png'
          : exportType === 'image/webp'
            ? 'webp'
            : 'jpg';
      const uploadFile = new File([blob], `cover.${ext}`, { type: exportType });
      const fd = new FormData();
      fd.append('file', uploadFile);
      const { data } = await apiClient.post(
        `/repositories/${repo.id}/cover`,
        fd,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      const newCoverUrl = (data as any)?.coverImage;
      onUpdated?.({ id: repo.id, coverImage: newCoverUrl });
      setCurrentCoverUrl(newCoverUrl);
      toast({
        title: '封面上传成功',
        description: '封面已更新，弹窗将自动关闭',
        variant: 'default',
      });
      // 清理状态
      setFile(null);
      setImageSrc(prev => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      setCroppedAreaPixels(null);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
      // 延迟关闭弹窗
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (e: any) {
      // 统一错误提示由拦截器处理
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent
        onClose={onClose}
        className="max-w-6xl p-0 border-0 sm:rounded-3xl shadow-2xl overflow-hidden bg-gradient-to-br from-background via-background to-muted/20"
      >
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 pb-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              仓库设置
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground mt-2">
              编辑仓库基本信息、可见性、发布状态与社区封面
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-8 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* 基本信息 */}
            <div className="space-y-8">
              <div className="space-y-3">
                <Label
                  htmlFor="repo-name"
                  className="text-sm font-semibold text-foreground"
                >
                  仓库名称
                </Label>
                <Input
                  id="repo-name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="仓库名称（ID 不可更改，仅名称可改）"
                  className="h-11 border-2 focus:border-primary/50 transition-all duration-200"
                />
                <p className="text-xs text-muted-foreground">
                  仓库 ID 唯一且不可变更，此处仅修改显示名称。
                </p>
              </div>
              <div className="space-y-3">
                <Label
                  htmlFor="repo-desc"
                  className="text-sm font-semibold text-foreground"
                >
                  仓库描述
                </Label>
                <Textarea
                  id="repo-desc"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="为仓库添加一句话简介"
                  className="min-h-[100px] border-2 focus:border-primary/50 transition-all duration-200 resize-none"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground">
                  仓库可见性
                </Label>
                <Select
                  value={visibility}
                  onValueChange={v => setVisibility(v as RepoVisibility)}
                >
                  <SelectTrigger className="h-11 border-2 focus:border-primary/50 transition-all duration-200">
                    <SelectValue placeholder="选择可见性" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLIC">
                      公开（所有人可见，可互动）
                    </SelectItem>
                    <SelectItem value="INTERNAL">
                      公开只读（所有人可见，互动受限，仅成员/Owner可评）
                    </SelectItem>
                    <SelectItem value="PRIVATE">私有（仅成员可见）</SelectItem>
                  </SelectContent>
                </Select>
                <ul className="text-xs text-muted-foreground mt-2 space-y-1 list-disc pl-4">
                  <li>
                    <b>仅可查看</b>
                    ：所有人可见，但评论与互动权限受限（仅成员/Owner）。
                  </li>
                  <li>
                    <b>私有</b>：仅仓库成员可见，其他人无法访问。
                  </li>
                </ul>
              </div>
              <div className="flex items-center justify-between bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-5 border border-primary/20">
                <div className="mr-4">
                  <Label
                    htmlFor="publish-toggle"
                    className="text-sm font-semibold text-foreground"
                  >
                    发布到社区
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    开启后，符合条件（公开或只读）的仓库会出现在&ldquo;社区&rdquo;中。
                  </p>
                  {repo.publishedAt && (
                    <p className="text-xs text-muted-foreground mt-1">
                      首次发布于：{new Date(repo.publishedAt).toLocaleString()}
                    </p>
                  )}
                </div>
                <button
                  id="publish-toggle"
                  role="switch"
                  aria-checked={isPublished}
                  onClick={() => setIsPublished(v => !v)}
                  className={cn(
                    'relative inline-flex h-7 w-12 items-center rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isPublished ? 'bg-primary' : 'bg-muted'
                  )}
                  aria-label={isPublished ? '已发布' : '未发布'}
                >
                  <span
                    className={cn(
                      'inline-block h-5 w-5 transform rounded-full bg-background shadow transition-transform',
                      isPublished ? 'translate-x-6' : 'translate-x-1'
                    )}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between gap-4 pt-4">
                <Button
                  onClick={doSave}
                  disabled={saving}
                  variant="default"
                  className="h-11 px-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {saving ? '保存中…' : '保存基本信息'}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setConfirmOpen(true)}
                  className="h-11 px-6 hover:shadow-lg transition-all duration-200"
                >
                  删除仓库
                </Button>
              </div>
              <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent
                  className="max-w-sm p-6"
                  onClose={() => setConfirmOpen(false)}
                >
                  <DialogHeader>
                    <DialogTitle>确认删除仓库？</DialogTitle>
                    <DialogDescription>
                      删除后不可恢复，确定继续？
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline-subtle"
                      onClick={() => setConfirmOpen(false)}
                    >
                      取消
                    </Button>
                    <Button variant="destructive" onClick={doDelete}>
                      确认删除
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* 社区封面 */}
            <div className="space-y-6">
              <Label className="text-sm font-semibold text-foreground">
                社区封面
              </Label>
              {/* 预览图：横向封面效果 */}
              <div className="relative w-full h-48 md:h-60 rounded-2xl overflow-hidden bg-gradient-to-br from-muted/50 to-muted border-2 border-dashed border-muted-foreground/20 shadow-inner">
                {currentCoverUrl ? (
                  <Image
                    src={currentCoverUrl}
                    alt="cover"
                    fill
                    sizes="640px"
                    className="object-cover transition-all duration-300"
                    unoptimized
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <div className="text-sm">暂无封面</div>
                    </div>
                  </div>
                )}
              </div>

              <Separator className="my-4 bg-gradient-to-r from-transparent via-border to-transparent" />

              {/* 下方正方形选择/裁剪区域：左右与上方预览对齐（填满整列宽度） */}
              <div className="space-y-4 flex flex-col items-stretch">
                <div
                  className={cn(
                    'relative w-full aspect-[16/9] rounded-2xl border-2 border-dashed bg-gradient-to-br from-muted/20 to-muted/40 overflow-hidden transition-all duration-200',
                    !imageSrc
                      ? 'cursor-pointer hover:border-primary/50 hover:bg-primary/5'
                      : 'cursor-default border-primary/30'
                  )}
                  onClick={
                    !imageSrc ? () => inputRef.current?.click() : undefined
                  }
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
                    <div className="h-full w-full flex items-center justify-center text-muted-foreground hover:text-primary transition-colors duration-200">
                      <div className="text-center">
                        <div className="text-sm font-medium">点击选择图片</div>
                        <div className="text-xs opacity-70">(16:9 比例)</div>
                      </div>
                    </div>
                  )}
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={onFileChange}
                  />
                </div>

                {imageSrc && (
                  <div className="flex items-center gap-4 w-full bg-muted/30 rounded-xl p-4">
                    <span className="text-sm font-medium text-muted-foreground shrink-0">
                      缩放调节
                    </span>
                    <input
                      type="range"
                      min={1}
                      max={3}
                      step={0.05}
                      value={zoom}
                      onChange={(e: any) => setZoom(parseFloat(e.target.value))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-xs text-muted-foreground shrink-0 min-w-[3rem] text-right">
                      {zoom.toFixed(1)}x
                    </span>
                  </div>
                )}

                {/* 重置按钮和文件格式说明 */}
                <div className="flex items-center justify-between gap-4 w-full">
                  <div className="flex items-center gap-3">
                    {imageSrc && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setFile(null);
                          setImageSrc(prev => {
                            if (prev) URL.revokeObjectURL(prev);
                            return null;
                          });
                          setCroppedAreaPixels(null);
                          setZoom(1);
                          setCrop({ x: 0, y: 0 });
                        }}
                        className="h-11 px-6 hover:shadow-md transition-all duration-200"
                      >
                        重置选择
                      </Button>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap bg-muted/50 px-3 py-1 rounded-full">
                    支持 PNG / JPEG / WEBP，最大 2MB
                  </span>
                </div>

                {/* 上传封面按钮 - 与左侧删除仓库按钮对齐 */}
                <div className="flex justify-end pt-4">
                  <Button
                    onClick={doUploadCover}
                    disabled={!imageSrc || uploading}
                    variant="default"
                    className="h-11 px-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {uploading ? '上传中…' : '上传封面'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
