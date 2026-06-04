'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { useQuery } from '@tanstack/react-query';
import api from '../app/lib/api';
import { Button } from '@/components/ui/button';
import { 
  Menu, X, ShoppingBag, LogOut, User, 
  LayoutDashboard, BookOpen, Calendar, Trophy, MessageSquare 
} from 'lucide-react';

interface NavbarProps {
  alwaysWhite?: boolean;
}

export default function Navbar({ alwaysWhite = false }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
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
    router.push('/');
  };

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Courses', href: '/hobbies' },
    { label: 'Lessons', href: '/lessons' },
    { label: 'Events', href: '/events' },
    { label: 'Marketplace', href: '/shops' },
    { label: 'Resources', href: '/resources' },
    { label: 'Blog', href: '/blog' },
    { label: 'About', href: '/about' },
  ];

  // Helper to check role matching
  const hasRole = (role: string) => user?.roles?.includes(role);

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        alwaysWhite || scrolled 
          ? 'h-20 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 text-[#1F2937]' 
          : 'h-20 bg-transparent text-[#1F2937]'
      }`}>
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-14 h-full flex justify-between items-center">
          
          {/* Logo */}
          <Link href="/" className="flex items-center focus:outline-none">
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
            {user ? (
              <>
                {/* Cart link for students/scholars */}
                {(hasRole('student') || hasRole('scholar')) && (
                  <Link href="/cart" className="relative p-2 rounded-xl text-gray-500 hover:text-[#FF7A45] hover:bg-[#FFF2EB] transition-all">
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
                      {hasRole('admin') ? 'Admin' : hasRole('teacher') ? 'Teacher' : hasRole('seller') ? 'Seller' : 'Student'}
                    </p>
                  </div>
                  
                  <div className="flex gap-1.5">
                    {/* Role-based workspace shortcuts */}
                    {hasRole('admin') && (
                      <Link href="/admin">
                        <Button size="sm" variant="ghost" className="h-8 text-xs font-bold text-[#1F2937] hover:text-[#FF7A45] hover:bg-[#FFF2EB] rounded-lg">
                          Admin
                        </Button>
                      </Link>
                    )}
                    {hasRole('teacher') && (
                      <Link href="/teacher">
                        <Button size="sm" variant="ghost" className="h-8 text-xs font-bold text-[#1F2937] hover:text-[#FF7A45] hover:bg-[#FFF2EB] rounded-lg">
                          Teacher
                        </Button>
                      </Link>
                    )}
                    {hasRole('seller') && (
                      <Link href="/seller">
                        <Button size="sm" variant="ghost" className="h-8 text-xs font-bold text-[#1F2937] hover:text-[#FF7A45] hover:bg-[#FFF2EB] rounded-lg">
                          Seller
                        </Button>
                      </Link>
                    )}
                    
                    {/* Default workspace links */}
                    <Link href="/dashboard">
                      <Button size="sm" className="h-8 text-xs font-bold bg-[#1F2937] hover:bg-[#FF7A45] text-white rounded-lg px-3">
                        Workspace
                      </Button>
                    </Link>

                    <Button size="icon" variant="ghost" onClick={handleLogout} className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg">
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <button className="h-11 px-5 rounded-2xl font-bold text-sm text-gray-700 hover:bg-gray-100 active:scale-98 transition-all">
                    Login
                  </button>
                </Link>
                <Link href="/register">
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
      </header>

      {/* Mobile Drawer Menu */}
      <div className={`fixed inset-0 z-40 bg-white transform transition-transform duration-300 lg:hidden flex flex-col pt-24 px-6 justify-between ${
        isMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col gap-4 overflow-y-auto">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              onClick={() => setIsMenuOpen(false)}
              className="text-lg font-bold text-[#1F2937] border-b border-gray-50 pb-2.5"
            >
              {link.label}
            </Link>
          ))}
          
          {user && (
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">My Workspace</p>
              
              <Link 
                href="/dashboard" 
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 text-base font-bold text-[#1F2937] hover:text-[#FF7A45]"
              >
                <LayoutDashboard className="w-5 h-5 text-[#FF7A45]" />
                Student Workspace
              </Link>

              {hasRole('admin') && (
                <Link 
                  href="/admin" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 text-base font-bold text-[#1F2937] hover:text-[#FF7A45]"
                >
                  <User className="w-5 h-5 text-[#FF7A45]" />
                  Admin Dashboard
                </Link>
              )}

              {hasRole('teacher') && (
                <Link 
                  href="/teacher" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 text-base font-bold text-[#1F2937] hover:text-[#FF7A45]"
                >
                  <BookOpen className="w-5 h-5 text-[#FF7A45]" />
                  Teacher Portal
                </Link>
              )}

              {hasRole('seller') && (
                <Link 
                  href="/seller" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 text-base font-bold text-[#1F2937] hover:text-[#FF7A45]"
                >
                  <ShoppingBag className="w-5 h-5 text-[#FF7A45]" />
                  Seller Central
                </Link>
              )}

              <Link 
                href="/chat" 
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 text-base font-bold text-[#1F2937] hover:text-[#FF7A45]"
              >
                <MessageSquare className="w-5 h-5 text-[#FF7A45]" />
                Direct Messages
              </Link>
            </div>
          )}
        </div>

        <div className="py-8 border-t border-gray-100 flex flex-col gap-3">
          {user ? (
            <Button 
              onClick={() => {
                setIsMenuOpen(false);
                handleLogout();
              }} 
              className="w-full h-12 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Link href="/login" onClick={() => setIsMenuOpen(false)} className="block w-full">
                <Button variant="outline" className="w-full h-12 rounded-xl font-bold border-gray-200">
                  Login
                </Button>
              </Link>
              <Link href="/register" onClick={() => setIsMenuOpen(false)} className="block w-full">
                <Button className="w-full h-12 bg-[#FF7A45] hover:bg-[#ff8f61] text-white font-bold rounded-xl shadow-md shadow-[#FF7A45]/20">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
