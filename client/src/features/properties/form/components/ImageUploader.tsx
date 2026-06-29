'use client';
/**
 * Image uploader — drag/drop + Cloudinary upload.
 * Returns array of { publicId, url } via onChange.
 */
import { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { uploadsApi } from '@/features/properties/api/uploads.api';
import { Button } from '@/shared/components/ui/button';
import { toast } from 'sonner';
import { MAX_IMAGES } from '@/shared/lib/constants';
import type { PropertyImage } from '@/shared/types/property';

interface ImageUploaderProps {
  value: PropertyImage[];
  onChange: (next: PropertyImage[]) => void;
}

export function ImageUploader({ value, onChange }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: FileList) {
    const arr = Array.from(files);
    const available = MAX_IMAGES - value.length;
    if (arr.length > available) {
      toast.error(`الحد الأقصى ${MAX_IMAGES} صور — يمكنك إضافة ${available} فقط`);
      return;
    }
    setUploading(true);
    try {
      const uploaded = await uploadsApi.images(arr);
      onChange([...value, ...uploaded]);
      toast.success(`تم رفع ${uploaded.length} صورة`);
    } catch {
      toast.error('فشل رفع الصور');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function remove(publicId: string) {
    onChange(value.filter((img) => img.publicId !== publicId));
    uploadsApi.remove(publicId).catch(() => {});
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {value.map((img) => (
          <div
            key={img.publicId}
            className="group relative aspect-square overflow-hidden rounded-lg border border-border"
          >
            <Image src={img.url} alt="upload" fill sizes="25vw" className="object-cover" />
            <button
              type="button"
              onClick={() => remove(img.publicId)}
              aria-label="حذف الصورة"
              className="absolute top-1.5 end-1.5 size-7 rounded-full bg-black/60 hover:bg-red-600 text-white flex items-center justify-center shadow-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}

        {value.length < MAX_IMAGES && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="aspect-square rounded-lg border-2 border-dashed border-border bg-secondary/40 hover:bg-secondary hover:border-primary transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground"
          >
            {uploading ? (
              <Loader2 className="size-6 animate-spin" />
            ) : (
              <>
                <Upload className="size-6" />
                <span className="text-xs">إضافة صور</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />

      <p className="mt-2 text-xs text-muted-foreground">
        {value.length}/{MAX_IMAGES} صور • PNG, JPG (5MB max per image)
      </p>
    </div>
  );
}
