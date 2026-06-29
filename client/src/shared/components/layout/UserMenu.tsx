'use client';
/**
 * Avatar dropdown for authenticated users.
 * Shows username + links to user pages + logout.
 */
import { User as UserIcon, LayoutGrid, Heart, BookmarkPlus, LogOut } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/config/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function UserMenu() {
  const t = useTranslations('nav');
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring">
          <Avatar className="size-8 min-[380px]:size-9 border border-border cursor-pointer">
            {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
            <AvatarFallback className="bg-secondary text-muted-foreground">
              <UserIcon className="size-4 min-[380px]:size-5" />
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-foreground">{user.name}</span>
            <span className="text-xs text-muted-foreground">{user.email ?? user.phone}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/my-properties" className="gap-2">
            <LayoutGrid className="size-4" />
            {t('myProperties')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/wishlist" className="gap-2">
            <Heart className="size-4" />
            {t('wishlist')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/saved-searches" className="gap-2">
            <BookmarkPlus className="size-4" />
            {t('savedSearches')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profile" className="gap-2">
            <UserIcon className="size-4" />
            {t('profile')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="gap-2 text-destructive focus:text-destructive">
          <LogOut className="size-4" />
          {t('logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
