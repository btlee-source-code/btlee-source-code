import { useTranslations } from 'next-intl';
import { Home } from 'lucide-react';
import { Link } from '@/config/navigation';
import { Button } from '@/shared/components/ui/button';

export default function NotFound() {
  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-7xl font-bold text-primary">404</p>
      <h1 className="mt-4 text-2xl font-bold text-foreground">الصفحة غير موجودة</h1>
      <p className="mt-2 text-muted-foreground max-w-md">
        الصفحة التي تبحث عنها غير موجودة أو تم نقلها
      </p>
      <Button asChild className="mt-6">
        <Link href="/">
          <Home className="size-4" />
          الرجوع للرئيسية
        </Link>
      </Button>
    </div>
  );
}
