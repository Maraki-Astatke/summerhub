'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, LogOut, Home, Settings, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DashboardUser {
  email: string;
  profile?: {
    firstName?: string;
    lastName?: string;
  };
}

interface DashboardHeaderProps {
  user: DashboardUser | null;
  logout: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  roleName: string;
}

export default function DashboardHeader({
  user,
  logout,
  sidebarOpen,
  setSidebarOpen,
  roleName,
}: DashboardHeaderProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLanguage = (newLocale: string) => {
    const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPathname);
  };

  const displayName =
    user?.profile?.firstName && user?.profile?.lastName
      ? `${user.profile.firstName} ${user.profile.lastName}`
      : user?.profile?.firstName || user?.email?.split('@')[0] || 'User';

  const initials =
    user?.profile?.firstName?.[0] ||
    user?.email?.[0]?.toUpperCase() ||
    'U';

  const handleLogout = () => {
    logout();
    router.push(`/${locale}`);
  };

  const menuItems = [
    { label: 'Home', href: `/${locale}`, icon: Home },
    { label: 'Settings', href: `/${locale}/settings`, icon: Settings },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 shadow-sm font-sans">
      <div className="h-full px-4 md:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? (
              <X className="h-5 w-5 text-gray-700 dark:text-gray-200" />
            ) : (
              <Menu className="h-5 w-5 text-gray-700 dark:text-gray-200" />
            )}
          </button>

          <Link href={`/${locale}`} className="flex items-center gap-2.5 flex-shrink-0">
            <Image
              src="/logo.png"
              alt="HobbyHub Education"
              width={140}
              height={36}
              priority
              className="h-8 w-auto object-contain"
            />
            <span className="text-lg font-extrabold text-[#1F2937] dark:text-white tracking-tight hidden sm:inline">
              HobbyHub
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <div className="hidden sm:flex items-center bg-gray-100/80 dark:bg-gray-700/50 rounded-xl p-0.5 border border-gray-200/50 dark:border-gray-600/50">
            <button
              type="button"
              onClick={() => switchLanguage('en')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                locale === 'en'
                  ? 'bg-white dark:bg-gray-600 text-[#FF7A45] shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => switchLanguage('am')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                locale === 'am'
                  ? 'bg-white dark:bg-gray-600 text-[#FF7A45] shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              አማ
            </button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2.5 border border-gray-200/80 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-2xl py-1.5 pl-1.5 pr-3 min-w-0 outline-none hover:border-[#FF7A45]/30 hover:shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-[#FF7A45]/30"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF7A45]/20 to-[#FF7A45]/5 flex items-center justify-center flex-shrink-0 ring-1 ring-[#FF7A45]/15">
                  <span className="text-[#FF7A45] font-bold text-sm">{initials}</span>
                </div>
                <div className="hidden md:block text-left min-w-0">
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-100 leading-tight truncate max-w-[130px]">
                    {displayName}
                  </p>
                  <p className="text-[10px] font-semibold text-[#FF7A45] uppercase tracking-wide">
                    {roleName}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2 shadow-xl border border-gray-100 dark:border-gray-700">
              <DropdownMenuLabel className="px-3 py-3 font-normal">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#FF7A45]/20 to-[#FF7A45]/5 flex items-center justify-center ring-1 ring-[#FF7A45]/15">
                    <span className="text-[#FF7A45] font-bold">{initials}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{displayName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-1" />
              {menuItems.map((item) => (
                <DropdownMenuItem key={item.label} asChild className="rounded-xl px-3 py-2.5 cursor-pointer">
                  <Link href={item.href} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#FFF2EB] dark:bg-[#FF7A45]/10 flex items-center justify-center">
                      <item.icon className="h-4 w-4 text-[#FF7A45]" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{item.label}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="rounded-xl px-3 py-2.5 text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20 cursor-pointer"
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                    <LogOut className="h-4 w-4 text-red-500" />
                  </div>
                  <span className="text-sm font-semibold">Logout</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
