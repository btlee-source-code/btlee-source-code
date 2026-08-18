'use client';
/**
 * Bell icon in the navbar with a badge for unread count.
 * Click opens a dropdown listing the latest notifications.
 */
import { useEffect, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Button } from '@/shared/components/ui/button';
import { Separator } from '@/shared/components/ui/separator';
import { notificationsApi } from '@/features/notifications/api/notifications.api';
import { Link } from '@/config/navigation';
import type { Notification } from '@/shared/types/api';
import { formatDate } from '@/shared/lib/utils';

function extractQuotedLabel(message: string): string | null {
  return message.match(/["“”]([^"“”]+)["“”]/u)?.[1]?.trim() || null;
}

function extractRejectionReason(message: string): string | null {
  return message.match(/(?:السبب|Reason):\s*(.+)$/iu)?.[1]?.trim() || null;
}

export function NotificationsBell() {
  const t = useTranslations('notifications');
  const locale = useLocale();
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);

  // Refresh count on every open (no real-time per the plan)
  useEffect(() => {
    notificationsApi.unreadCount().then((r) => setUnread(r.unreadCount)).catch(() => {});
  }, []);

  async function load() {
    try {
      const list = await notificationsApi.list();
      setItems(list);
    } catch {
      // silent
    }
  }

  useEffect(() => {
    if (open) load();
  }, [open]);

  async function markAllRead() {
    await notificationsApi.markAllRead();
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnread(0);
  }

  function localizedContent(notification: Notification) {
    const label = extractQuotedLabel(notification.message);

    switch (notification.type) {
      case 'listing_approved':
        return {
          title: t('listingApprovedTitle'),
          message: label
            ? t('listingApprovedMessage', { listing: label })
            : t('listingApprovedMessageGeneric'),
        };
      case 'listing_rejected': {
        const reason = extractRejectionReason(notification.message);
        return {
          title: t('listingRejectedTitle'),
          message: reason
            ? t('listingRejectedMessageWithReason', { reason })
            : t('listingRejectedMessage'),
        };
      }
      case 'listing_expired':
        return {
          title: t('listingExpiredTitle'),
          message: label
            ? t('listingExpiredMessage', { listing: label })
            : t('listingExpiredMessageGeneric'),
        };
      case 'saved_search_match':
        return {
          title: t('savedSearchMatchTitle'),
          message: t('savedSearchMatchMessage'),
        };
      case 'listing_reported':
        return {
          title: t('listingReportedTitle'),
          message: t('listingReportedMessage'),
        };
      default:
        return { title: notification.title, message: notification.message };
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative size-9 min-[380px]:size-10">
          <Bell className="size-4 min-[380px]:size-5" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-3 py-2">
          <h3 className="font-semibold text-sm">{t('title')}</h3>
          {items.some((n) => !n.isRead) && (
            <button
              onClick={markAllRead}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <CheckCheck className="size-3" />
              {t('markAllRead')}
            </button>
          )}
        </div>
        <Separator />
        <div className="max-h-80 overflow-y-auto">
          {items.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">{t('empty')}</div>
          ) : (
            items.map((n) => {
              const content = localizedContent(n);
              return (
                <Link
                  key={n._id}
                  href={(n.link as never) ?? '/'}
                  className={`block px-3 py-2.5 hover:bg-secondary transition-colors border-b border-border last:border-0 ${!n.isRead ? 'bg-secondary/50' : ''}`}
                  onClick={() => setOpen(false)}
                >
                  <div className="flex items-start gap-2">
                    {!n.isRead && (
                      <span className="mt-1.5 size-2 shrink-0 rounded-full bg-accent" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium leading-tight">{content.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {content.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground/70 mt-1">
                        {formatDate(n.createdAt, locale === 'ar' ? 'ar' : 'en')}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
