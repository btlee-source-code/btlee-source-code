'use client';
/**
 * Admin sidebar — fixed on desktop, off-canvas drawer on mobile.
 *
 * The host layout owns the drawer open/close state and passes it down,
 * so other surfaces (e.g. the top bar's menu button) can trigger it.
 */
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Building2,
  Car,
  Users,
  Flag,
  Star,
  LogOut,
  X,
} from 'lucide-react';
import { Link, usePathname } from '@/config/navigation';
import { Logo } from '@/shared/components/layout/Logo';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { AdminThemeToggle } from './AdminTheme';
import { cn } from '@/shared/lib/utils';

const links = [
  { href: '/admin/dashboard', label: 'الرئيسية', icon: LayoutDashboard },
  { href: '/admin/properties', label: 'العقارات', icon: Building2 },
  { href: '/admin/cars', label: 'العربيات', icon: Car },
  { href: '/admin/featured', label: 'المميزة', icon: Star },
  { href: '/admin/users', label: 'المستخدمين', icon: Users },
  { href: '/admin/reports', label: 'التقارير', icon: Flag },
];

interface AdminSidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ mobileOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  // Auto-close the drawer when the route changes
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Lock body scroll while the drawer is open on mobile
  useEffect(() => {
    if (!mobileOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [mobileOpen]);

  return (
    <>
      {/* Desktop sidebar — sticky panel from lg up */}
      <aside className="hidden lg:flex w-64 shrink-0 border-e border-border bg-card flex-col h-screen sticky top-0">
        <SidebarBody />
      </aside>

      {/* Mobile drawer — always in DOM, slid off-canvas when closed */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.button
            key="admin-drawer-backdrop"
            type="button"
            aria-label="إغلاق القائمة"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-40 bg-black/55 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          'fixed inset-y-0 start-0 z-50 w-72 max-w-[85%] bg-card border-e border-border shadow-2xl flex flex-col lg:hidden',
          'transition-transform duration-200 ease-out',
          mobileOpen
            ? 'translate-x-0 rtl:translate-x-0'
            : '-translate-x-full rtl:translate-x-full',
        )}
        aria-hidden={!mobileOpen}
      >
        <SidebarBody onItemClick={onClose} showCloseButton onClose={onClose} />
      </aside>
    </>
  );
}

interface SidebarBodyProps {
  onItemClick?: () => void;
  showCloseButton?: boolean;
  onClose?: () => void;
}

function SidebarBody({ onItemClick, showCloseButton, onClose }: SidebarBodyProps) {
  const pathname = usePathname();
  const { admin, logout } = useAdminAuth(false);

  return (
    <>
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Logo size="sm" />
        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary"
          >
            <X className="size-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const isActive = pathname?.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href as never}
              onClick={onItemClick}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
              )}
            >
              <link.icon className="size-4 shrink-0" />
              <span className="truncate">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border space-y-2">
        <div className="flex items-center justify-between gap-2 px-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">مسجل بـ</p>
            <p className="font-medium text-sm text-foreground truncate">{admin?.email}</p>
          </div>
          <AdminThemeToggle />
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="size-4" />
          تسجيل الخروج
        </button>
      </div>
    </>
  );
}
