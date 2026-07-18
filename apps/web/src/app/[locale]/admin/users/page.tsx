'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Ban, CheckCircle2, Loader2, Search } from 'lucide-react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { adminApi, type UserAdmin } from '@/features/admin/api/admin.api';
import { useAdminAuth } from '@/features/admin/hooks/useAdminAuth';
import { formatDate } from '@/shared/lib/utils';
import { toast } from 'sonner';

// How many users each page / "load more" click fetches.
const PAGE_SIZE = 20;

export default function AdminUsersPage() {
  const { isAuthenticated, isHydrated } = useAdminAuth();

  const [users, setUsers] = useState<UserAdmin[]>([]);
  const [total, setTotal] = useState(0);
  const [pagesLoaded, setPagesLoaded] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  // Debounce the typed query into the applied search term.
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Reloads pages 1..count for the current search and replaces the list. Used on
  // mount, when the search changes (count=1), and after a mutation
  // (count=pagesLoaded) so the loaded window is preserved.
  const loadFrom = useCallback(
    async (count: number) => {
      setIsLoading(true);
      try {
        const all: UserAdmin[] = [];
        let loaded = 1;
        let pages = 1;
        let count_ = 0;
        for (let p = 1; p <= count; p++) {
          const { items, meta } = await adminApi.listUsersPaged({
            page: p,
            limit: PAGE_SIZE,
            search: search || undefined,
          });
          all.push(...items);
          pages = meta?.totalPages ?? 1;
          count_ = meta?.total ?? all.length;
          loaded = p;
          if (p >= pages) break; // no more pages to fetch
        }
        setUsers(all);
        setPagesLoaded(loaded);
        setTotalPages(pages);
        setTotal(count_);
      } catch {
        toast.error('تعذّر تحميل المستخدمين');
      } finally {
        setIsLoading(false);
      }
    },
    [search]
  );

  // Appends the next page without disturbing the ones already shown.
  async function loadMore() {
    const next = pagesLoaded + 1;
    setIsLoadingMore(true);
    try {
      const { items, meta } = await adminApi.listUsersPaged({
        page: next,
        limit: PAGE_SIZE,
        search: search || undefined,
      });
      setUsers((prev) => [...prev, ...items]);
      setPagesLoaded(next);
      setTotalPages(meta?.totalPages ?? totalPages);
      setTotal(meta?.total ?? total);
    } catch {
      toast.error('تعذّر تحميل المزيد');
    } finally {
      setIsLoadingMore(false);
    }
  }

  // Initial load + reload whenever the applied search changes.
  useEffect(() => {
    if (!isAuthenticated) return;
    loadFrom(1);
  }, [isAuthenticated, loadFrom]);

  const refetch = useCallback(() => loadFrom(pagesLoaded), [loadFrom, pagesLoaded]);

  async function toggleBlock(id: string, isBlocked: boolean) {
    await adminApi.blockUser(id, !isBlocked);
    toast.success(isBlocked ? 'تم فك الحظر' : 'تم الحظر');
    refetch();
  }

  const hasMore = pagesLoaded < totalPages;

  if (!isHydrated || !isAuthenticated) return null;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2.5 mb-5 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">المستخدمون</h1>
          {!isLoading && (
            <span className="inline-flex items-center justify-center rounded-full bg-secondary px-2.5 h-6 text-sm font-semibold text-muted-foreground tabular-nums">
              {total}
            </span>
          )}
        </div>

        {/* Search by name / email / phone */}
        <div className="relative mb-5 max-w-md">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="ابحث عن مستخدم بالاسم أو البريد أو الهاتف..."
            className="ps-9"
          />
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 sm:h-20 rounded-xl bg-secondary animate-pulse" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <Card className="p-10 sm:p-16 text-center text-muted-foreground border-dashed">
            {search ? 'لا يوجد مستخدم مطابق لبحثك' : 'لا يوجد مستخدمون'}
          </Card>
        ) : (
          <>
            <div className="space-y-3">
              {users.map((u) => (
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

            {hasMore && (
              <div className="mt-5 flex justify-center">
                <Button onClick={loadMore} disabled={isLoadingMore} variant="outline" className="min-w-40">
                  {isLoadingMore && <Loader2 className="size-4 animate-spin" />}
                  عرض المزيد
                </Button>
              </div>
            )}

            <p className="mt-3 text-center text-xs text-muted-foreground tabular-nums">
              عرض {users.length} من {total}
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
