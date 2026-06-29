'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from '@/config/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useAdminAuth } from '@/features/admin/hooks/useAdminAuth';
import { HttpError } from '@/shared/api/httpClient';
import { toast } from 'sonner';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
type Input = z.infer<typeof schema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAdminAuth(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Input>({ resolver: zodResolver(schema) });

  async function onSubmit(input: Input) {
    setSubmitting(true);
    try {
      await login(input.email, input.password);
      toast.success('مرحباً بعودتك');
      router.push('/admin/dashboard');
    } catch (e) {
      toast.error(
        e instanceof HttpError && e.status === 429
          ? 'لقد تجاوزت عدد المحاولات المسموح بها. يُرجى الانتظار 15 دقيقة ثم المحاولة مرة أخرى.'
          : 'بيانات الدخول غير صحيحة'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary px-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-2xl">
          <CardHeader className="text-center">
            <div className="size-14 rounded-2xl bg-primary mx-auto flex items-center justify-center mb-3">
              <Shield className="size-7 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">لوحة تحكم بيت لي</CardTitle>
            <p className="text-sm text-muted-foreground">دخول المسؤولين فقط</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">كلمة المرور</Label>
                <Input id="password" type="password" {...register('password')} />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                {submitting && <Loader2 className="size-4 animate-spin" />}
                تسجيل الدخول
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
