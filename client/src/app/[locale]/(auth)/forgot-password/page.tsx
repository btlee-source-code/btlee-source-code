'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from '@/config/navigation';
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

const schema = z.object({ email: z.string().email() });
type Input = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const t = useTranslations('auth');
  const tErr = useTranslations('errors');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  usePageTitle(t('resetPasswordTitle'));
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Input>({ resolver: zodResolver(schema) });

  async function onSubmit(input: Input) {
    setSubmitting(true);
    try {
      await authApi.forgotPassword(input.email);
      setDone(true);
    } catch (e) {
      toast.error(
        e instanceof HttpError && e.status === 429
          ? tErr('tooManyAttempts')
          : tErr('generic')
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
          <CardTitle className="text-2xl">{t('resetPasswordTitle')}</CardTitle>
          <CardDescription>{t('resetPasswordDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          {done ? (
            <div className="py-6 text-center">
              <CheckCircle2 className="size-12 text-emerald-600 mx-auto mb-3" />
              <p className="text-foreground font-medium">تم إرسال الرابط</p>
              <p className="text-sm text-muted-foreground mt-2">
                لو الإيميل ده مسجل عندنا، هتلاقي رسالة في بريدك خلال دقائق
              </p>
              <Button asChild className="mt-5">
                <Link href="/login">العودة لتسجيل الدخول</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">{t('email')}</Label>
                <Input id="email" type="email" autoComplete="email" {...register('email')} />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              <Button type="submit" disabled={submitting} className="w-full" size="lg">
                {submitting && <Loader2 className="size-4 animate-spin" />}
                {t('sendResetLink')}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                <Link href="/login" className="text-primary hover:underline">
                  العودة لتسجيل الدخول
                </Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
