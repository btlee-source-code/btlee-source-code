'use client';
/**
 * Reset Password — completes the forgot-password flow. The email link points
 * here with a `?token=...`; the user picks a new password and we POST it to
 * /auth/reset-password.
 */
import { useMemo, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useRouter } from '@/config/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Logo } from '@/shared/components/layout/Logo';
import { authApi } from '@/features/auth/api/auth.api';
import { HttpError } from '@/shared/api/httpClient';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { toast } from 'sonner';

function buildSchema(tErr: (key: string) => string) {
  return z
    .object({
      password: z
        .string()
        .min(8, tErr('passwordMin'))
        .regex(/[a-zA-Z]/, tErr('passwordLetter'))
        .regex(/[0-9]/, tErr('passwordDigit')),
      confirmPassword: z.string().min(1),
    })
    .refine((d) => d.password === d.confirmPassword, {
      message: tErr('passwordNoMatch'),
      path: ['confirmPassword'],
    });
}

type ResetInput = z.infer<ReturnType<typeof buildSchema>>;

function ResetPasswordContent() {
  const t = useTranslations('auth');
  const tErr = useTranslations('errors');
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const schema = useMemo(() => buildSchema(tErr), [tErr]);

  usePageTitle(t('newPasswordTitle'));

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetInput>({ resolver: zodResolver(schema) });

  async function onSubmit(input: ResetInput) {
    setSubmitting(true);
    try {
      await authApi.resetPassword(token, input.password);
      setDone(true);
      toast.success(t('resetSuccess'));
      setTimeout(() => router.push('/login'), 1500);
    } catch (e) {
      if (e instanceof HttpError && e.status === 429) {
        toast.error(tErr('tooManyAttempts'));
      } else {
        // 400 (bad/expired token) or anything else
        toast.error(t('resetInvalidToken'));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-border shadow-lg">
        <CardHeader className="text-center pb-3">
          <div className="flex justify-center mb-4">
            <Logo size="md" />
          </div>
          <CardTitle className="text-2xl">{t('newPasswordTitle')}</CardTitle>
          <CardDescription>{t('newPasswordSubtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          {!token ? (
            <div className="py-6 text-center">
              <AlertTriangle className="size-12 text-amber-500 mx-auto mb-3" />
              <p className="text-foreground font-medium">{t('resetInvalidToken')}</p>
              <Button asChild className="mt-5">
                <Link href="/forgot-password">{t('forgotPassword')}</Link>
              </Button>
            </div>
          ) : done ? (
            <div className="py-6 text-center">
              <CheckCircle2 className="size-12 text-emerald-600 mx-auto mb-3" />
              <p className="text-foreground font-medium">{t('resetSuccess')}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="password">{t('newPassword')}</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button type="submit" disabled={submitting} className="w-full" size="lg">
                {submitting && <Loader2 className="size-4 animate-spin" />}
                {t('setNewPassword')}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                <Link href="/login" className="text-primary hover:underline">
                  {t('backToLogin')}
                </Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function ResetPasswordPage() {
  const tc = useTranslations('common');
  return (
    <Suspense
      fallback={<div className="text-center text-muted-foreground">{tc('loading')}</div>}
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
