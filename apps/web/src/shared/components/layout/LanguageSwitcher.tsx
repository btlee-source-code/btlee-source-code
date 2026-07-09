'use client';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/config/navigation';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

interface LanguageSwitcherProps {
  /** `dropdown` (default) for the top bar; `inline` for the mobile menu. */
  variant?: 'dropdown' | 'inline';
  /** Called after switching — used to close the mobile menu. */
  onSwitch?: () => void;
}

const LOCALES: { code: 'ar' | 'en'; label: string }[] = [
  { code: 'ar', label: 'العربية' },
  { code: 'en', label: 'English' },
];

export function LanguageSwitcher({ variant = 'dropdown', onSwitch }: LanguageSwitcherProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchTo(target: 'ar' | 'en') {
    router.replace(pathname, { locale: target });
    onSwitch?.();
  }

  // Inline row — used inside the mobile menu so the switcher isn't in the top bar.
  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <Globe className="size-4 text-muted-foreground" />
        {LOCALES.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => switchTo(l.code)}
            className={cn(
              'rounded-md px-2.5 py-1 text-sm transition-colors',
              locale === l.code
                ? 'bg-secondary font-semibold text-foreground'
                : 'text-muted-foreground hover:bg-secondary'
            )}
          >
            {l.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5">
          <Globe className="size-4" />
          <span className="text-xs font-semibold uppercase">{locale}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[8rem]">
        <DropdownMenuItem onClick={() => switchTo('ar')} className="gap-2">
          <span className="text-base">🇪🇬</span>
          <span>العربية</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => switchTo('en')} className="gap-2">
          <span className="text-base">🇬🇧</span>
          <span>English</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
