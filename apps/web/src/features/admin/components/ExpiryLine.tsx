import { CalendarClock, Infinity as InfinityIcon } from 'lucide-react';

const dateFormatter = new Intl.DateTimeFormat('ar-EG', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

/** Expiry state of a listing, shown to admins on the moderation rows. */
export function ExpiryLine({
  status,
  expiresAt,
  neverExpires,
}: {
  status: string;
  expiresAt: string;
  neverExpires?: boolean;
}) {
  if (neverExpires) {
    return (
      <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
        <InfinityIcon className="size-3 shrink-0" />
        مدة مفتوحة — بدون تاريخ انتهاء
      </p>
    );
  }

  // Before approval the timestamp is a placeholder: the clock starts on approval.
  if (status === 'pending' || status === 'rejected') return null;

  const date = new Date(expiresAt);
  if (Number.isNaN(date.getTime())) return null;

  const expired = status === 'expired';

  return (
    <p
      className={`text-xs mt-1 flex items-center gap-1 ${
        expired ? 'text-destructive' : 'text-muted-foreground'
      }`}
    >
      <CalendarClock className="size-3 shrink-0" />
      {expired ? 'انتهت في' : 'تنتهي في'} {dateFormatter.format(date)}
    </p>
  );
}
