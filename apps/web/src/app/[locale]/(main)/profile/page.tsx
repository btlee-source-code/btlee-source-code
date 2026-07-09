'use client';
import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useRouter } from '@/config/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Separator } from '@/shared/components/ui/separator';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { usersApi } from '@/features/account/api/users.api';
import { toast } from 'sonner';

// `name` relies on the global Zod error map; the password rules carry their
// own localized wording (built inside the component with the translator).
const profileSchema = z.object({
  name: z.string().min(2).max(60),
});

export default function ProfilePage() {
  const t = useTranslations('nav');
  const tErr = useTranslations('errors');
  const router = useRouter();
  usePageTitle(t('profile'));
  const { user, isAuthenticated, isHydrated, setUser } = useAuth();

  useEffect(() => {
    if (isHydrated && !isAuthenticated) router.push('/login');
  }, [isHydrated, isAuthenticated, router]);

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const passwordSchema = useMemo(
    () =>
      z.object({
        currentPassword: z.string().min(1),
        newPassword: z
          .string()
          .min(8, tErr('passwordMin'))
          .regex(/[a-zA-Z]/, tErr('passwordLetter'))
          .regex(/[0-9]/, tErr('passwordDigit')),
      }),
    [tErr]
  );

  const {
    register: regProfile,
    handleSubmit: handleProfile,
    formState: { errors: profileErr },
    reset: resetProfile,
  } = useForm<{ name: string }>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '' },
  });

  const {
    register: regPwd,
    handleSubmit: handlePwd,
    formState: { errors: pwdErr },
    reset: resetPwd,
  } = useForm<{ currentPassword: string; newPassword: string }>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    if (user) resetProfile({ name: user.name });
  }, [user, resetProfile]);

  if (!user) return null;

  async function saveProfile(input: { name: string }) {
    setSavingProfile(true);
    try {
      const updated = await usersApi.updateMe(input);
      setUser(updated);
      toast.success('تم حفظ التغييرات');
    } catch {
      toast.error('فشل الحفظ');
    } finally {
      setSavingProfile(false);
    }
  }

  async function savePassword(input: { currentPassword: string; newPassword: string }) {
    setSavingPassword(true);
    try {
      await usersApi.changePassword(input.currentPassword, input.newPassword);
      toast.success('تم تغيير كلمة المرور');
      resetPwd();
    } catch {
      toast.error('كلمة المرور الحالية غير صحيحة');
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-6">{t('profile')}</h1>

        <Card className="border-border mb-6">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="size-16 border-2 border-border">
                <AvatarFallback className="text-xl bg-primary text-primary-foreground font-bold">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{user.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{user.email ?? user.phone}</p>
              </div>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <form onSubmit={handleProfile(saveProfile)} className="space-y-4">
              <div className="space-y-1.5">
                <Label>الاسم</Label>
                <Input {...regProfile('name')} />
                {profileErr.name && (
                  <p className="text-xs text-destructive">{profileErr.name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>{user.email ? 'البريد الإلكتروني' : 'رقم الهاتف'}</Label>
                <Input value={user.email ?? user.phone ?? ''} disabled />
              </div>

              <Button type="submit" disabled={savingProfile}>
                {savingProfile && <Loader2 className="size-4 animate-spin" />}
                حفظ التغييرات
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>تغيير كلمة المرور</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePwd(savePassword)} className="space-y-4">
              <div className="space-y-1.5">
                <Label>كلمة المرور الحالية</Label>
                <Input type="password" {...regPwd('currentPassword')} />
                {pwdErr.currentPassword && (
                  <p className="text-xs text-destructive">{pwdErr.currentPassword.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>كلمة المرور الجديدة</Label>
                <Input type="password" {...regPwd('newPassword')} />
                {pwdErr.newPassword && (
                  <p className="text-xs text-destructive">{pwdErr.newPassword.message}</p>
                )}
              </div>

              <Button type="submit" disabled={savingPassword}>
                {savingPassword && <Loader2 className="size-4 animate-spin" />}
                تغيير
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
