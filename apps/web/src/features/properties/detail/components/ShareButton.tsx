'use client';
import { Share2, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import { Button } from '@/shared/components/ui/button';
import { toast } from 'sonner';

interface ShareButtonProps {
  url: string;
  title: string;
}

export function ShareButton({ url, title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  function copyLink() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('تم نسخ الرابط');
    setTimeout(() => setCopied(false), 2000);
  }

  function shareWhatsApp() {
    const text = `${title}\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <Share2 className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-48 p-2">
        <button
          onClick={copyLink}
          className="flex items-center gap-2 w-full p-2 rounded hover:bg-secondary text-sm"
        >
          {copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
          نسخ الرابط
        </button>
        <button
          onClick={shareWhatsApp}
          className="flex items-center gap-2 w-full p-2 rounded hover:bg-secondary text-sm"
        >
          <Share2 className="size-4" />
          مشاركة على واتساب
        </button>
      </PopoverContent>
    </Popover>
  );
}
