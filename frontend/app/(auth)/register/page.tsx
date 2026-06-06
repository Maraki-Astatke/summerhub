'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/providers/auth-provider';
import { useLanguage } from '@/providers/language-provider';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      });
      toast.success('Registration successful! Please check your email to verify your account.');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF2EB] py-16 px-4 relative overflow-hidden">
      {/* Decorative Blob */}
      <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-[#FFE2D4] filter blur-3xl opacity-70 z-0 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] rounded-full bg-[#FFE2D4] filter blur-3xl opacity-70 z-0 pointer-events-none" />

      <Card className="w-full max-w-md border border-[#FF7A45]/10 rounded-[24px] shadow-xl shadow-[#FF7A45]/5 bg-white relative z-10 p-2">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto flex justify-center mb-4">
            <Image 
              src="/logo.png" 
              alt="HobbyHub Education" 
              width={160} 
              height={40} 
              priority 
              className="h-10 w-auto object-contain"
            />
          </div>
          <CardTitle className="text-3xl font-extrabold text-[#1F2937] tracking-tight">{t('auth.createAccount')}</CardTitle>
          <CardDescription className="text-sm text-[#6B7280]">{t('auth.registerDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-sm font-semibold text-[#1F2937]">{t('auth.firstName')}</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="h-11 px-4 rounded-xl border-gray-200 focus-visible:ring-[#FF7A45]"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-sm font-semibold text-[#1F2937]">{t('auth.lastName')}</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="h-11 px-4 rounded-xl border-gray-200 focus-visible:ring-[#FF7A45]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-semibold text-[#1F2937]">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="h-11 px-4 rounded-xl border-gray-200 focus-visible:ring-[#FF7A45]"
              />
              <p className="text-[11px] text-gray-400 font-medium">Only Gmail, Yahoo, or iCloud allowed</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-sm font-semibold text-[#1F2937]">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="0912345678"
                value={formData.phone}
                onChange={handleChange}
                required
                className="h-11 px-4 rounded-xl border-gray-200 focus-visible:ring-[#FF7A45]"
              />
              <p className="text-[11px] text-gray-400 font-medium">Ethiopian format: 09XXXXXXXX or 07XXXXXXXX</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-semibold text-[#1F2937]">{t('auth.password')}</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                className="h-11 px-4 rounded-xl border-gray-200 focus-visible:ring-[#FF7A45]"
              />
              <p className="text-[11px] text-gray-400 font-medium leading-tight">Min 8 characters with uppercase, lowercase, number, special char</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold text-[#1F2937]">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="h-11 px-4 rounded-xl border-gray-200 focus-visible:ring-[#FF7A45]"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-[#FF7A45] hover:bg-[#ff8f61] text-[#1F2937] font-semibold rounded-xl shadow-md shadow-[#FF7A45]/15 transition-all duration-200 hover:shadow-lg mt-2" 
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Register'}
            </Button>
          </form>

          <p className="text-center text-sm text-[#6B7280] mt-6">
            {t('auth.haveAccount')}{' '}
            <Link href="/login" className="text-[#FF7A45] font-semibold hover:underline">
              {t('nav.login')}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}