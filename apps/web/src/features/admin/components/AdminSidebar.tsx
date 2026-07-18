'use client';
/**
 * Admin sidebar — fixed on desktop, off-canvas drawer on mobile.
 *
 * The host layout owns the drawer open/close state and passes it down,
 * so other surfaces (e.g. the top bar's menu button) can trigger it.
 */
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  LayoutGrid,
  Building2,
  Car,
  Users,
  Flag,
  Star,
  ChevronDown,
  LogOut,
  X,
} from 'lucide-react';
import { Link, usePathname } from '@/config/navigation';
import { Logo } from '@/shared/components/layout/Logo';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { AdminThemeToggle } from './AdminTheme';
import { cn } from '@/shared/lib/utils';

type IconType = React.ComponentType<{ className?: string }>;

interface GroupChild {
  href: string;
  label: string;
  icon: IconType;
  // Match the path exactly instead of by prefix — needed when one child's path
  // is a prefix of another (e.g. /admin/featured vs /admin/featured/cars).
  exact?: boolean;
}
interface NavGroup {
  label: string;
  icon: IconType;
  children: GroupChild[];
}

// Flat link at the top; the two collapsible groups; then the flat links below.
const dashboardLink = { href: '/admin/dashboard', label: 'الرئيسية', icon: LayoutDashboard };
const bottomLinks = [
  { href: '/admin/users', label: 'المستخدمين', icon: Users },
  { href: '/admin/reports', label: 'التقارير', icon: Flag },
];

// Each group expands into a section picker (العقارات / العربيات).
const groups: NavGroup[] = [
  {
    label: 'الأقسام',
    icon: LayoutGrid,
    children: [
      { href: '/admin/properties', label: 'العقارات', icon: Building2 },
      { href: '/admin/cars', label: 'العربيات', icon: Car },
    ],
  },
  {
    label: 'المميزة',
    icon: Star,
    children: [
      { href: '/admin/featured', label: 'العقارات', icon: Building2, exact: true },
      { href: '/admin/featured/cars', label: 'السيارات', icon: Car },
    ],
  },
];

function childActive(child: GroupChild, pathname: string | null): boolean {
  return child.exact ? pathname === child.href : (pathname?.startsWith(child.href) ?? false);
}

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
        <Logo size="lg" />
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
        <NavLink link={dashboardLink} pathname={pathname} onItemClick={onItemClick} />

        {groups.map((group) => (
          <CollapsibleGroup
            key={group.label}
            group={group}
            pathname={pathname}
            onItemClick={onItemClick}
          />
        ))}

        {bottomLinks.map((link) => (
          <NavLink key={link.href} link={link} pathname={pathname} onItemClick={onItemClick} />
        ))}
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

interface NavLinkItem {
  href: string;
  label: string;
  icon: IconType;
}

function NavLink({
  link,
  pathname,
  onItemClick,
}: {
  link: NavLinkItem;
  pathname: string | null;
  onItemClick?: () => void;
}) {
  const isActive = pathname?.startsWith(link.href);
  return (
    <Link
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
}

/**
 * A nav entry that expands into a section picker: tapping it slides down its
 * children (العقارات / العربيات) so the admin picks which section to manage.
 * Opens automatically while on any of its child routes. Used for both
 * "الأقسام" and "المميزة".
 */
function CollapsibleGroup({
  group,
  pathname,
  onItemClick,
}: {
  group: NavGroup;
  pathname: string | null;
  onItemClick?: () => void;
}) {
  const anyActive = group.children.some((c) => childActive(c, pathname));
  const [open, setOpen] = useState(anyActive);

  useEffect(() => {
    if (anyActive) setOpen(true);
  }, [anyActive]);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          'w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
          anyActive
            ? 'bg-primary/10 text-foreground'
            : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
        )}
      >
        <group.icon className="size-4 shrink-0" />
        <span className="truncate flex-1 text-start">{group.label}</span>
        <ChevronDown className={cn('size-4 shrink-0 transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="mt-1 ms-4 ps-3 border-s border-border space-y-1">
              {group.children.map((child) => (
                <Link
                  key={child.href}
                  href={child.href as never}
                  onClick={onItemClick}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    childActive(child, pathname)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                  )}
                >
                  <child.icon className="size-4 shrink-0" />
                  <span className="truncate">{child.label}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
