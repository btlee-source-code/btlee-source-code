'use client';
import { useState, type ReactNode } from 'react';
import { CalendarClock, Infinity as InfinityIcon, Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/shared/components/ui/dialog';
import { Label } from '@/shared/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { adminApi, type ExtendRenewal } from '@/features/admin/api/admin.api';
import { toast } from 'sonner';

// Mirrors the durations the owner can pick in the mobile listing form.
const DURATIONS = [30, 60, 90, 180, 365];
const OPEN_ENDED = 'open';

// Radix renders a button[data-state], not a checked input, so the selected
// styling is driven off state rather than a `:checked` CSS variant.
function optionClass(active: boolean): string {
  return `flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
    active ? 'border-primary bg-primary/5' : 'border-border hover:bg-secondary/50'
  }`;
}

/**
 * Renews expired listings — the only path out of `expired`, for one listing or
 * a whole selection. Open-ended is deliberately admin-only, so it lives here
 * rather than in any owner-facing form.
 */
export function ExtendListingDialog({
  domain,
  ids,
  onDone,
  trigger,
}: {
  domain: 'properties' | 'cars';
  ids: string[];
  onDone: () => void;
  trigger: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [choice, setChoice] = useState<string>('30');
  const [submitting, setSubmitting] = useState(false);

  const label = domain === 'cars' ? 'عربية' : 'عقار';
  const many = ids.length > 1;

  async function submit() {
    const renewal: ExtendRenewal =
      choice === OPEN_ENDED ? { neverExpires: true } : { durationDays: Number(choice) };

    setSubmitting(true);
    try {
      const { modifiedCount } =
        domain === 'cars'
          ? await adminApi.extendCars(ids, renewal)
          : await adminApi.extendProperties(ids, renewal);

      toast.success(
        choice === OPEN_ENDED
          ? `تم فتح مدة ${modifiedCount} إعلان بدون تاريخ انتهاء`
          : `تم تجديد ${modifiedCount} إعلان لمدة ${choice} يوم`
      );
      setOpen(false);
      onDone();
    } catch {
      toast.error('تعذّر تجديد الإعلانات');
    } finally {
      setSubmitting(false);
    }
  }

  // Reset on open so a previous "open-ended" pick is never silently reapplied
  // to the next listing the admin renews.
  function onOpenChange(next: boolean) {
    if (next) setChoice('30');
    setOpen(next);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md w-[calc(100vw-2rem)]">
        <DialogHeader>
          <DialogTitle>
            {many ? `تجديد ${ids.length} إعلان` : `تجديد إعلان ${label}`}
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground leading-relaxed">
          اختر المدة الجديدة. هيرجع الإعلان منشوراً على المنصة فوراً، والمدة
          هتبدأ من دلوقتي.
        </p>

        <RadioGroup value={choice} onValueChange={setChoice} className="gap-2">
          {DURATIONS.map((d) => (
            <Label
              key={d}
              htmlFor={`duration-${d}`}
              className={optionClass(choice === String(d))}
            >
              <RadioGroupItem value={String(d)} id={`duration-${d}`} />
              <CalendarClock className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">{d} يوم</span>
            </Label>
          ))}

          <Label htmlFor="duration-open" className={optionClass(choice === OPEN_ENDED)}>
            <RadioGroupItem value={OPEN_ENDED} id="duration-open" />
            <InfinityIcon className="size-4 text-amber-600" />
            <span className="min-w-0">
              <span className="block text-sm font-medium text-foreground">مدة مفتوحة</span>
              <span className="block text-xs text-muted-foreground">
                الإعلان ماينتهيش نهائياً — متاح من لوحة التحكم فقط
              </span>
            </span>
          </Label>
        </RadioGroup>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button onClick={submit} disabled={submitting} className="w-full sm:w-auto">
            {submitting && <Loader2 className="size-4 animate-spin" />}
            {many ? `تأكيد تجديد ${ids.length} إعلان` : 'تأكيد التجديد'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
