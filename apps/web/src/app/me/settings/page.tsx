'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/services/apiClient';
import { useAuth } from '@/hooks/use-auth';
import { triggerAvatarUpdate } from '@/hooks/use-avatar-sync';
import Link from 'next/link';
import Cropper from 'react-easy-crop';
import { Plus } from 'lucide-react';
import 'react-easy-crop/react-easy-crop.css';

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  // 裁剪相关
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  // 覆盖预览用，本地成功上传后立即生效
  const [avatarOverride, setAvatarOverride] = useState<string | null>(null);

  const avatarUrl = useMemo(() => {
    const a = avatarOverride ?? user?.avatar;
    return a ? a : null;
  }, [avatarOverride, user?.avatar]);

  // 进入页面拉取最新用户资料，确保左侧圆形预览能拿到最新头像
  useEffect(() => {
    let stopped = false;
    const load = async () => {
      try {
        const { data } = await apiClient.get('/_auth/profile');
        const url = (data as any)?.avatar as string | undefined;
        if (!stopped && url) setAvatarOverride(url);
      } catch {
        // 忽略失败，沿用 session 中的 user.avatar
      }
    };
    void load();
    return () => {
      stopped = true;
    };
  }, []);

  const handleSelectedFile = useCallback(
    (f: File) => {
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
        // 选择阶段放宽到 10MB，导出时再确保 <= 2MB
        toast({
          title: '图片较大',
          description: '将自动压缩导出以满足 2MB 限制',
        });
      }
      // 释放旧 URL
      setFile(prev => prev);
      setFile(f);
      const obj = URL.createObjectURL(f);
      setImageSrc(prev => {
        if (prev) URL.revokeObjectURL(prev);
        return obj;
      });
      setZoom(1);
      setCrop({ x: 0, y: 0 });
      setCroppedAreaPixels(null);
    },
    [toast]
  );

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (!f) return;
      handleSelectedFile(f);
      // 清空 input 以便重复选择同一文件
      e.currentTarget.value = '';
    },
    [handleSelectedFile]
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
      const f = e.dataTransfer.files?.[0];
      if (f) handleSelectedFile(f);
    },
    [handleSelectedFile]
  );

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  }, []);
  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const onCropComplete = useCallback(
    (
      _: any,
      areaPixels: { x: number; y: number; width: number; height: number }
    ) => {
      setCroppedAreaPixels(areaPixels);
    },
    []
  );

  useEffect(() => {
    return () => {
      if (imageSrc) URL.revokeObjectURL(imageSrc);
    };
  }, [imageSrc]);

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
    // 目标尺寸：导出为不超过 512x512 的正方形（等比）
    const maxSize = 512;
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
    // 将选择区域绘制到画布
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
    // 尝试多次质量压缩，确保 <= 2MB（仅针对有质量参数的格式）
    const supportsQuality = mime === 'image/jpeg' || mime === 'image/webp';
    const qualities = supportsQuality ? [0.92, 0.8, 0.7, 0.6] : [1];
    for (const q of qualities) {
      const blob: Blob = await new Promise(resolve =>
        canvas.toBlob(b => resolve(b as Blob), mime, q)
      );
      if (
        blob.size <= 2 * 1024 * 1024 ||
        q === qualities[qualities.length - 1]
      ) {
        return blob;
      }
    }
    // 理论不会到这里
    const fallback = await new Promise<Blob>(resolve =>
      canvas.toBlob(b => resolve(b as Blob))
    );
    return fallback;
  }

  const doUpload = async () => {
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
      const uploadFile = new File([blob], `avatar.${ext}`, {
        type: exportType,
      });
      const fd = new FormData();
      fd.append('file', uploadFile);
      const { data } = await apiClient.post('/api/users/me/avatar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const newAvatarUrl = (data as any)?.avatar || null;
      setAvatarOverride(newAvatarUrl);

      // 触发全局头像更新事件
      if (newAvatarUrl) {
        triggerAvatarUpdate(newAvatarUrl);
      }

      toast({ title: '头像已更新' });
      // 清理状态
      setFile(null);
      setImageSrc(prev => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      setCroppedAreaPixels(null);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
    } catch (e: any) {
      // 错误提示在 apiClient 拦截器已处理
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">个人设置</h1>
        <Button asChild variant="outline-subtle" size="sm">
          <Link href="/me">返回</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 头像设置 */}
        <Card>
          <CardHeader>
            <CardTitle>头像</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-6">
              <div className="relative h-24 w-24 overflow-hidden rounded-full border">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="avatar"
                    fill
                    sizes="96px"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                    无头像
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-3">
                <div className="flex flex-col gap-3">
                  <div
                    className={[
                      'relative h-60 w-60 rounded-2xl border border-dashed bg-muted/10 overflow-hidden',
                      'flex items-center justify-center select-none',
                      !imageSrc ? 'cursor-pointer' : 'cursor-default',
                      !imageSrc && dragOver
                        ? 'border-primary bg-primary/5'
                        : 'border-border',
                    ].join(' ')}
                    onClick={
                      !imageSrc ? () => inputRef.current?.click() : undefined
                    }
                    onDrop={!imageSrc ? onDrop : undefined}
                    onDragOver={!imageSrc ? onDragOver : undefined}
                    onDragLeave={!imageSrc ? onDragLeave : undefined}
                    role={!imageSrc ? 'button' : undefined}
                    aria-label={!imageSrc ? '上传头像' : undefined}
                  >
                    {imageSrc ? (
                      <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        cropShape="rect"
                        showGrid={false}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                        objectFit="cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Plus className="h-10 w-10" />
                      </div>
                    )}
                    <input
                      ref={inputRef}
                      id="avatar"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={onFileChange}
                      className="hidden"
                    />
                  </div>
                  {imageSrc && (
                    <div className="flex items-center gap-3 w-60">
                      <span className="text-xs text-muted-foreground shrink-0">
                        缩放
                      </span>
                      <input
                        type="range"
                        min={1}
                        max={3}
                        step={0.05}
                        value={zoom}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setZoom(parseFloat(e.target.value))
                        }
                        className="w-full"
                      />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      onClick={doUpload}
                      disabled={!imageSrc || uploading}
                    >
                      {uploading ? '上传中…' : '上传并保存'}
                    </Button>
                    {imageSrc && (
                      <Button
                        variant="outline-subtle"
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
                      >
                        重置选择
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    支持 PNG / JPEG / WEBP，导出后最大
                    2MB。可拖拽图片到正方形区域，滚轮缩放，拖动裁剪。
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 用户名显示（不可修改） */}
        <Card>
          <CardHeader>
            <CardTitle>用户名</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <Label>当前用户名</Label>
                <div className="mt-2 p-3 bg-muted/50 rounded-md">
                  <p className="text-sm font-medium">{user?.username}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                用户名是您的唯一身份标识，注册后不可修改。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
