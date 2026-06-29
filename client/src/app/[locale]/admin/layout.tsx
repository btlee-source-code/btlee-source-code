/**
 * Admin layout.
 * Login page renders without sidebar — handled here.
 */
'use client';
import { usePathname } from 'next/navigation';
import { AdminShell } from '@/features/admin/components/AdminShell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname?.endsWith('/admin/login');

  if (isLoginPage) {
    return <>{children}</>;
  }

  return <AdminShell>{children}</AdminShell>;
}
