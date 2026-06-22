'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useAuth } from '@/providers/auth-provider';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { 
  ShoppingBag, LogOut, Menu, X, LayoutDashboard, User, 
  BookOpen, MessageSquare 
} from 'lucide-react';

interface NavbarProps {
  alwaysWhite?: boolean;
}

export default function Navbar({ alwaysWhite = false }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { data: cart } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const response = await api.get('/cart');
      return response.data;
    },
    enabled: !!user && (user.roles?.includes('student') || user.roles?.includes('scholar')),
    retry: false,
  });

  const handleLogout = () => {
    logout();
    router.push(`/${locale}`);
  };

  const switchLanguage = (newLocale: string) => {
    const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPathname);
  };

  const navLinks = [
    { label: t('nav.home'), href: `/${locale}` },
    { label: t('nav.courses'), href: `/${locale}/hobbies` },
    { label: t('nav.lessons'), href: `/${locale}/lessons` },
    { label: t('nav.events'), href: `/${locale}/events` },
    { label: 'Talent Events', href: `/${locale}/talent-events` },
    { label: t('nav.about'), href: `/${locale}/about` },
  ];

  const hasRole = (role: string) => user?.roles?.includes(role);
  const isWhite = alwaysWhite || scrolled;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isWhite 
        ? 'h-20 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 text-[#1F2937]' 
        : 'h-20 bg-transparent text-[#1F2937]'
    }`}>
      <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-14 h-full flex justify-between items-center">
        
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center focus:outline-none">
          <Image 
            src="/logo.png" 
            alt="HobbyHub Education" 
            width={160} 
            height={40} 
            priority 
            className="h-10 w-auto object-contain"
          />
        </Link>
        
        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href} 
                href={link.href} 
                className={`text-sm font-semibold transition-colors duration-200 ${
                  isActive 
                    ? 'text-[#FF7A45]' 
                    : 'text-gray-500 hover:text-[#FF7A45]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop CTA Action Buttons */}
        <div className="hidden lg:flex items-center gap-4">
          
          {/* Language Switcher */}
          <div className="flex items-center bg-gray-100/80 rounded-xl p-0.5 border border-gray-200/50 mr-2">
            <button 
              onClick={() => switchLanguage('en')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                locale === 'en' 
                  ? 'bg-white text-[#FF7A45] shadow-sm' 
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              EN
            </button>
            <button 
              onClick={() => switchLanguage('am')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                locale === 'am' 
                  ? 'bg-white text-[#FF7A45] shadow-sm' 
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              አማ
            </button>
          </div>

          {user ? (
            <>
              {/* Cart link for students/scholars */}
              {(hasRole('student') || hasRole('scholar')) && (
                <Link href={`/${locale}/cart`} className="relative p-2 rounded-xl text-gray-500 hover:text-[#FF7A45] hover:bg-[#FFF2EB] transition-all">
                  <ShoppingBag className="w-5.5 h-5.5" />
                  {cart?.itemCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-[#FF7A45] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border border-white">
                      {cart.itemCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Workspace / Dashboard Dropdown Panel */}
              <div className="flex items-center gap-2 border border-gray-100 bg-gray-50/50 rounded-2xl p-1.5 pl-3">
                <div className="text-right pr-2">
                  <p className="text-xs font-bold text-[#1F2937] leading-tight">
                    {user.profile?.firstName || user.email.split('@')[0]}
                  </p>
                  <p className="text-[9px] font-bold text-[#FF7A45] uppercase tracking-wider">
                    {hasRole('admin') ? 'Admin' : hasRole('teacher') ? 'Teacher' : hasRole('seller') ? 'Seller' : hasRole('parent') ? 'Parent' : hasRole('scholarship_giver') ? 'Scholar Provider' : 'Student'}
                  </p>
                </div>
                
                <div className="flex gap-1.5">
                  {hasRole('admin') && (
                    <Link href={`/${locale}/admin`}>
                      <Button size="sm" variant="ghost" className="h-8 text-xs font-bold text-[#1F2937] hover:text-[#FF7A45] hover:bg-[#FFF2EB] rounded-lg">
                        Admin
                      </Button>
                    </Link>
                  )}
                  {hasRole('teacher') && (
                    <Link href={`/${locale}/teacher`}>
                      <Button size="sm" variant="ghost" className="h-8 text-xs font-bold text-[#1F2937] hover:text-[#FF7A45] hover:bg-[#FFF2EB] rounded-lg">
                        Teacher
                      </Button>
                    </Link>
                  )}
                  {hasRole('seller') && (
                    <Link href={`/${locale}/seller`}>
                      <Button size="sm" variant="ghost" className="h-8 text-xs font-bold text-[#1F2937] hover:text-[#FF7A45] hover:bg-[#FFF2EB] rounded-lg">
                        Seller
                      </Button>
                    </Link>
                  )}
                  
                  <Link href={`/${locale}/dashboard`}>
                    <Button size="sm" className="h-8 text-xs font-bold bg-[#1F2937] hover:bg-[#FF7A45] text-white rounded-lg px-3">
                      Workspace
                    </Button>
                  </Link>

                  <Button size="icon" variant="ghost" onClick={handleLogout} className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Sign Out">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link href={`/${locale}/login`}>
                <button className="h-11 px-5 rounded-2xl font-bold text-sm text-gray-700 hover:bg-gray-100 active:scale-98 transition-all">
                  Login
                </button>
              </Link>
              <Link href={`/${locale}/register`}>
                <button className="h-11 px-6 rounded-2xl bg-[#FF7A45] text-white font-bold text-sm hover:bg-[#ff8f61] active:scale-98 transition-all shadow-md shadow-[#FF7A45]/20">
                  Get Started
                </button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburguer Toggle */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden p-2 rounded-xl text-[#1F2937] hover:bg-gray-100 focus:outline-none"
          aria-label="Toggle Menu"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t py-4 px-6 absolute top-20 left-0 right-0 shadow-lg">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                onClick={() => setIsMenuOpen(false)}
                className="text-lg font-bold text-[#1F2937] border-b border-gray-100 pb-2.5"
              >
                {link.label}
              </Link>
            ))}
            
            {user && (
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Workspace</p>
                
                <Link href={`/${locale}/dashboard`} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 text-base font-bold text-[#1F2937] hover:text-[#FF7A45]">
                  <LayoutDashboard className="w-5 h-5 text-[#FF7A45]" />
                  Dashboard
                </Link>

                {hasRole('admin') && (
                  <Link href={`/${locale}/admin`} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 text-base font-bold text-[#1F2937] hover:text-[#FF7A45]">
                    <User className="w-5 h-5 text-[#FF7A45]" />
                    Admin
                  </Link>
                )}

                {hasRole('teacher') && (
                  <Link href={`/${locale}/teacher`} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 text-base font-bold text-[#1F2937] hover:text-[#FF7A45]">
                    <BookOpen className="w-5 h-5 text-[#FF7A45]" />
                    Teacher
                  </Link>
                )}

                {hasRole('seller') && (
                  <Link href={`/${locale}/seller`} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 text-base font-bold text-[#1F2937] hover:text-[#FF7A45]">
                    <ShoppingBag className="w-5 h-5 text-[#FF7A45]" />
                    Seller
                  </Link>
                )}

                {hasRole('parent') && (
                  <Link href={`/${locale}/parent`} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 text-base font-bold text-[#1F2937] hover:text-[#FF7A45]">
                    <User className="w-5 h-5 text-[#FF7A45]" />
                    Parent
                  </Link>
                )}

                <Link href={`/${locale}/chat`} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 text-base font-bold text-[#1F2937] hover:text-[#FF7A45]">
                  <MessageSquare className="w-5 h-5 text-[#FF7A45]" />
                  Messages
                </Link>
              </div>
            )}
            
            <div className="py-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-gray-500">Language</span>
                <div className="flex items-center bg-gray-100 rounded-xl p-0.5">
                  <button onClick={() => switchLanguage('en')} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${locale === 'en' ? 'bg-white text-[#FF7A45] shadow-sm' : 'text-gray-500'}`}>
                    English
                  </button>
                  <button onClick={() => switchLanguage('am')} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${locale === 'am' ? 'bg-white text-[#FF7A45] shadow-sm' : 'text-gray-500'}`}>
                    አማርኛ
                  </button>
                </div>
              </div>

              {user ? (
                <Button onClick={() => { setIsMenuOpen(false); handleLogout(); }} className="w-full h-12 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link href={`/${locale}/login`} onClick={() => setIsMenuOpen(false)} className="block w-full">
                    <Button variant="outline" className="w-full h-12 rounded-xl font-bold">Login</Button>
                  </Link>
                  <Link href={`/${locale}/register`} onClick={() => setIsMenuOpen(false)} className="block w-full">
                    <Button className="w-full h-12 bg-[#FF7A45] hover:bg-[#ff8f61] text-white font-bold rounded-xl">Get Started</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}