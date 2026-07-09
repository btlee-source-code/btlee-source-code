'use client';
import { motion } from 'framer-motion';
import { Ban, CheckCircle2 } from 'lucide-react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { useFetch } from '@/shared/hooks/useFetch';
import { adminApi } from '@/features/admin/api/admin.api';
import { useAdminAuth } from '@/features/admin/hooks/useAdminAuth';
import { formatDate } from '@/shared/lib/utils';
import { toast } from 'sonner';

export default function AdminUsersPage() {
  const { isAuthenticated, isHydrated } = useAdminAuth();
  const { data, isLoading, refetch } = useFetch(
    () => adminApi.listUsers(),
    [],
    { enabled: isAuthenticated }
  );

  if (!isHydrated || !isAuthenticated) return null;

  async function toggleBlock(id: string, isBlocked: boolean) {
    await adminApi.blockUser(id, !isBlocked);
    toast.success(isBlocked ? 'تم فك الحظر' : 'تم الحظر');
    refetch();
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-5 sm:mb-6">المستخدمون</h1>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 sm:h-20 rounded-xl bg-secondary animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {data?.map((u) => (
              <Card key={u._id} className="border-border p-3 sm:p-4 overflow-hidden">
                <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                  <Avatar className="size-11 sm:size-12 border border-border shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                      {u.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground truncate">{u.name}</h3>
                      {u.isBlocked && <Badge variant="rejected">محظور</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{u.email ?? u.phone}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      مسجل منذ {formatDate(u.createdAt)}
                    </p>
                    {/* Mobile-only action button below info */}
                    <Button
                      variant={u.isBlocked ? 'outline' : 'destructive'}
                      size="sm"
                      onClick={() => toggleBlock(u._id, u.isBlocked)}
                      className="mt-3 sm:hidden w-full"
                    >
                      {u.isBlocked ? (
                        <>
                          <CheckCircle2 className="size-4" />
                          فك الحظر
                        </>
                      ) : (
                        <>
                          <Ban className="size-4" />
                          حظر
                        </>
                      )}
                    </Button>
                  </div>
                  {/* Desktop action button */}
                  <Button
                    variant={u.isBlocked ? 'outline' : 'destructive'}
                    size="sm"
                    onClick={() => toggleBlock(u._id, u.isBlocked)}
                    className="hidden sm:inline-flex shrink-0"
                  >
                    {u.isBlocked ? (
                      <>
                        <CheckCircle2 className="size-4" />
                        فك الحظر
                      </>
                    ) : (
                      <>
                        <Ban className="size-4" />
                        حظر
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
