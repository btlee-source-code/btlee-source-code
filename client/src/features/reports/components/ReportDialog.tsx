'use client';
import { useState } from 'react';
import { Flag } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import { reportsApi } from '@/features/reports/api/reports.api';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { REPORT_REASONS } from '@/shared/lib/constants';
import { toast } from 'sonner';

const reasonLabels: Record<string, string> = {
  fake_listing: 'إعلان مزيف',
  wrong_info: 'معلومات خاطئة',
  duplicate: 'إعلان مكرر',
  inappropriate: 'محتوى غير لائق',
  spam: 'سبام',
  other: 'سبب آخر',
};

export function ReportDialog({ propertyId }: { propertyId: string }) {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!reason) return toast.error('اختر سبب الإبلاغ');
    setSubmitting(true);
    try {
      await reportsApi.create(propertyId, reason, details || undefined);
      toast.success('تم إرسال الإبلاغ، شكراً لك');
      setOpen(false);
      setReason('');
      setDetails('');
    } catch {
      toast.error('حدث خطأ');
    } finally {
      setSubmitting(false);
    }
  }

  if (!isAuthenticated) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <Flag className="size-4" />
          الإبلاغ
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>الإبلاغ عن إعلان</DialogTitle>
          <DialogDescription>
            ساعدنا في الحفاظ على جودة المنصة بالإبلاغ عن المخالفات
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger>
              <SelectValue placeholder="اختر سبب الإبلاغ" />
            </SelectTrigger>
            <SelectContent>
              {REPORT_REASONS.map((r) => (
                <SelectItem key={r} value={r}>
                  {reasonLabels[r]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Textarea
            placeholder="تفاصيل إضافية (اختياري)"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            maxLength={500}
          />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            إلغاء
          </Button>
          <Button onClick={submit} disabled={submitting} variant="destructive">
            إرسال الإبلاغ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
