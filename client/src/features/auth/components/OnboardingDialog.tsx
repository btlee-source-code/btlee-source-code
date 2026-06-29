'use client';
/**
 * Onboarding Modal — shown after registration.
 * Asks the user about their goal so the platform can tailor the UX.
 */
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ShoppingBag, KeyRound, Home, Eye, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { usersApi } from '@/features/account/api/users.api';
import { useAuth } from '../hooks/useAuth';
import type { UserGoal } from '@/shared/lib/constants';

interface OnboardingDialogProps {
  open: boolean;
  onComplete: () => void;
}

const goals: { id: UserGoal; icon: typeof Home; key: string }[] = [
  { id: 'buy', icon: ShoppingBag, key: 'buy' },
  { id: 'rent', icon: KeyRound, key: 'rent' },
  { id: 'sell', icon: Home, key: 'sell' },
  { id: 'browse', icon: Eye, key: 'browse' },
];

export function OnboardingDialog({ open, onComplete }: OnboardingDialogProps) {
  const t = useTranslations('onboarding');
  const [selected, setSelected] = useState<UserGoal | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { setUser } = useAuth();

  async function submit() {
    if (!selected) return;
    setSubmitting(true);
    try {
      const updated = await usersApi.completeOnboarding(selected);
      setUser(updated);
      onComplete();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-lg" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">{t('title')}</DialogTitle>
          <DialogDescription className="text-center">{t('subtitle')}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 py-4">
          {goals.map((goal, i) => (
            <motion.button
              key={goal.id}
              type="button"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              onClick={() => setSelected(goal.id)}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                selected === goal.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <div
                className={cn(
                  'size-12 rounded-full flex items-center justify-center transition-colors',
                  selected === goal.id ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                )}
              >
                <goal.icon className="size-6" />
              </div>
              <span className="font-medium text-sm">{t(goal.key)}</span>
            </motion.button>
          ))}
        </div>

        <div className="flex gap-2">
          <Button variant="ghost" className="flex-1" onClick={onComplete}>
            {t('skip')}
          </Button>
          <Button
            disabled={!selected || submitting}
            onClick={submit}
            className="flex-1"
          >
            {submitting && <Loader2 className="size-4 animate-spin" />}
            {t('continue')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
