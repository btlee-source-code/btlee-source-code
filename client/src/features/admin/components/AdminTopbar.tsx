'use client';
/**
 * Sticky top bar shown on tablet/mobile admin pages.
 * Hosts the drawer trigger, brand mark and theme toggle.
 */
import { Menu } from 'lucide-react';
import { Logo } from '@/shared/components/layout/Logo';
import { AdminThemeToggle } from './AdminTheme';

interface AdminTopbarProps {
  onMenuClick: () => void;
}

export function AdminTopbar({ onMenuClick }: AdminTopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 h-14 px-4 border-b border-border bg-card/95 backdrop-blur-md lg:hidden">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="فتح القائمة"
        className="inline-flex size-10 items-center justify-center rounded-md text-foreground hover:bg-secondary transition-colors"
      >
        <Menu className="size-5" />
      </button>
      <div className="flex-1 flex justify-center">
        <Logo size="sm" />
      </div>
      <AdminThemeToggle />
    </header>
  );
}
