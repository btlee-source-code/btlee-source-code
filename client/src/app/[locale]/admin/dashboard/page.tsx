'use client';
import { motion } from 'framer-motion';
import {
  Building2, Users, Clock, CheckCircle, XCircle, Flag, Star, Ban, ShoppingBag, KeyRound,
} from 'lucide-react';
import { Card } from '@/shared/components/ui/card';
import { useFetch } from '@/shared/hooks/useFetch';
import { adminApi } from '@/features/admin/api/admin.api';
import { useAdminAuth } from '@/features/admin/hooks/useAdminAuth';

export default function AdminDashboardPage() {
  const { isAuthenticated, isHydrated } = useAdminAuth();
  const { data: stats, isLoading } = useFetch(
    () => adminApi.dashboard(),
    [],
    { enabled: isAuthenticated }
  );

  if (!isHydrated || !isAuthenticated) return null;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-5 sm:mb-6">نظرة عامة</h1>

        {isLoading || !stats ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-24 sm:h-28 rounded-xl bg-secondary animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            <section>
              <h2 className="text-xs sm:text-sm font-semibold uppercase text-muted-foreground mb-3">
                العقارات
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatCard label="إجمالي" value={stats.properties.total} icon={Building2} />
                <StatCard label="بانتظار المراجعة" value={stats.properties.pending} icon={Clock} accent="amber" />
                <StatCard label="منشورة" value={stats.properties.approved} icon={CheckCircle} accent="emerald" />
                <StatCard label="مرفوضة" value={stats.properties.rejected} icon={XCircle} accent="red" />
                <StatCard label="مباعة" value={stats.properties.sold} icon={ShoppingBag} accent="violet" />
                <StatCard label="مؤجرة" value={stats.properties.rented} icon={KeyRound} accent="violet" />
                <StatCard label="مميزة" value={stats.properties.featured} icon={Star} accent="amber" />
              </div>
            </section>

            <section>
              <h2 className="text-xs sm:text-sm font-semibold uppercase text-muted-foreground mb-3">
                المستخدمون والتقارير
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatCard label="إجمالي المستخدمين" value={stats.users.total} icon={Users} />
                <StatCard label="محظورون" value={stats.users.blocked} icon={Ban} accent="red" />
                <StatCard label="تقارير مفتوحة" value={stats.reports.open} icon={Flag} accent="amber" />
              </div>
            </section>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  accent?: 'emerald' | 'amber' | 'red' | 'violet';
}) {
  const colorMap = {
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    violet: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
    default: 'bg-primary/10 text-primary',
  };
  const cls = colorMap[accent ?? 'default'] ?? colorMap.default;

  return (
    <Card className="border-border p-4 sm:p-5">
      <div className="flex flex-col-reverse items-start gap-2 min-[400px]:flex-row min-[400px]:justify-between min-[400px]:gap-3">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground mb-1 leading-tight">{label}</p>
          <p className="text-xl sm:text-2xl font-bold text-foreground tabular-nums">
            {value.toLocaleString('ar-EG')}
          </p>
        </div>
        <div className={`size-9 sm:size-10 rounded-lg flex items-center justify-center shrink-0 ${cls}`}>
          <Icon className="size-4 sm:size-5" />
        </div>
      </div>
    </Card>
  );
}
