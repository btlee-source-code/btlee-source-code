'use client';
import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
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
import { useAuth } from '@/features/auth/hooks/useAuth';
import { HttpError } from '@/shared/api/httpClient';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { toast } from 'sonner';
import { OnboardingDialog } from '@/features/auth/components/OnboardingDialog';
import { GoogleButton } from '@/features/auth/components/GoogleButton';

// Most messages come from the global Zod error map; password rules carry
// their own wording since the map can't infer regex intent.
const EGYPT_PHONE = /^01[0125][0-9]{8}$/;

function buildRegisterSchema(
  tErr: (key: string) => string
) {
  return z
    .object({
      name: z.string().min(2).max(60),
      email: z.string().trim().min(1).email(tErr('invalidEmail')),
      phone: z
        .string()
        .trim()
        .min(1)
        .refine((v) => EGYPT_PHONE.test(v.replace(/[\s-]/g, '')), tErr('invalidPhone')),
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

type RegisterInput = z.infer<ReturnType<typeof buildRegisterSchema>>;

export default function RegisterPage() {
  const t = useTranslations('auth');
  const tErr = useTranslations('errors');
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const schema = useMemo(() => buildRegisterSchema(tErr), [tErr]);

  usePageTitle(t('registerTitle'));

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(schema) });

  async function onSubmit(input: RegisterInput) {
    setSubmitting(true);
    try {
      await registerUser(input.name, input.email, input.phone, input.password);
      toast.success('تم إنشاء الحساب بنجاح');
      setShowOnboarding(true);
    } catch (e) {
      if (e instanceof HttpError && e.status === 429) {
        toast.error(tErr('tooManyAttempts'));
      } else if (
        e instanceof HttpError &&
        (e.status === 409 || e.message.toLowerCase().includes('already'))
      ) {
        toast.error(tErr('identifierInUse'));
      } else {
        toast.error(tErr('generic'));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
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
            <CardTitle className="text-2xl">{t('registerTitle')}</CardTitle>
            <CardDescription>{t('registerSubtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">{t('name')}</Label>
                <Input id="name" {...register('name')} />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">{t('email')}</Label>
                <Input id="email" type="email" autoComplete="email" {...register('email')} />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone">{t('phone')}</Label>
                <Input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="01012345678"
                  {...register('phone')}
                />
                {errors.phone && (
                  <p className="text-xs text-destructive">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">{t('password')}</Label>
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
                {t('createAccount')}
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
              {t('hasAccount')}{' '}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                {t('signIn')}
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <OnboardingDialog
        open={showOnboarding}
        onComplete={() => router.push('/')}
      />
    </>
  );
}
