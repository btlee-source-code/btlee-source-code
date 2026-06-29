'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useRouter } from '@/config/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Logo } from '@/shared/components/layout/Logo';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { HttpError } from '@/shared/api/httpClient';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { toast } from 'sonner';
import { GoogleButton } from '@/features/auth/components/GoogleButton';

// Messages come from the global Zod error map (localized automatically).
const schema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(1),
});

type LoginInput = z.infer<typeof schema>;

export default function LoginPage() {
  const t = useTranslations('auth');
  const tErr = useTranslations('errors');
  const router = useRouter();
  const { login } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  usePageTitle(t('loginTitle'));

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(schema) });

  async function onSubmit(input: LoginInput) {
    setSubmitting(true);
    try {
      await login(input.identifier, input.password);
      toast.success('تم تسجيل الدخول بنجاح');
      router.push('/');
    } catch (e) {
      toast.error(
        e instanceof HttpError && e.status === 429
          ? tErr('tooManyAttempts')
          : tErr('loginFailed')
      );
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
          <CardTitle className="text-2xl">{t('loginTitle')}</CardTitle>
          <CardDescription>{t('loginSubtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="identifier">{t('emailOrPhone')}</Label>
              <Input id="identifier" type="text" autoComplete="username" {...register('identifier')} />
              {errors.identifier && (
                <p className="text-xs text-destructive">{errors.identifier.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t('password')}</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  {t('forgotPassword')}
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" disabled={submitting} className="w-full" size="lg">
              {submitting && <Loader2 className="size-4 animate-spin" />}
              {t('signIn')}
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">{t('orDivider')}</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <div className="space-y-2">
            <GoogleButton />
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t('noAccount')}{' '}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              {t('createAccount')}
            </Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
