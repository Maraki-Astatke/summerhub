'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/providers/auth-provider';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const locale = useLocale();
  const { register } = useAuth();
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nationalId: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (id === 'nationalId' || id === 'phone') {
      setFormData({ ...formData, [id]: value.replace(/\D/g, '') });
      return;
    }
    setFormData({ ...formData, [id]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptedTerms) {
      toast.error('Please accept the Terms of Service and Privacy Policy');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    if (formData.nationalId.length < 16) {
      toast.error('National ID must be at least 16 digits');
      return;
    }

    if (!/^\d{16}$/.test(formData.nationalId)) {
      toast.error('National ID must be exactly 16 digits');
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
        nationalId: formData.nationalId,
      });
      toast.success('Registration successful! Please check your email to verify your account.');
      router.push(`/${locale}/login`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF2EB] py-16 px-4 relative overflow-hidden font-sans">
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
              <Label htmlFor="phone" className="text-sm font-semibold text-[#1F2937]">{t('auth.phone')}</Label>
              <Input
                id="phone"
                type="tel"
                inputMode="numeric"
                placeholder="0912345678"
                value={formData.phone}
                onChange={handleChange}
                required
                maxLength={10}
                className="h-11 px-4 rounded-xl border-gray-200 focus-visible:ring-[#FF7A45]"
              />
              <p className="text-[11px] text-gray-400 font-medium">Ethiopian format: 09XXXXXXXX or 07XXXXXXXX</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nationalId" className="text-sm font-semibold text-[#1F2937]">{t('auth.nationalId')}</Label>
              <Input
                id="nationalId"
                type="text"
                inputMode="numeric"
                placeholder="1234567890123456"
                value={formData.nationalId}
                onChange={handleChange}
                required
                minLength={16}
                maxLength={16}
                className="h-11 px-4 rounded-xl border-gray-200 focus-visible:ring-[#FF7A45]"
              />
              <p className="text-[11px] text-gray-400 font-medium">{t('auth.nationalIdHint')}</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-semibold text-[#1F2937]">{t('auth.password')}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="h-11 px-4 rounded-xl border-gray-200 focus-visible:ring-[#FF7A45] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="text-[11px] text-gray-400 font-medium leading-tight">Min 8 characters with uppercase, lowercase, number, special char</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold text-[#1F2937]">{t('auth.confirmPassword')}</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="h-11 px-4 rounded-xl border-gray-200 focus-visible:ring-[#FF7A45] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-[#FF7A45] focus:ring-[#FF7A45]"
              />
              <span className="text-sm text-[#6B7280] leading-snug">
                {t('auth.agreeTo')}{' '}
                <Link href={`/${locale}/terms`} className="text-[#FF7A45] font-semibold hover:underline">
                  {t('footer.terms')}
                </Link>{' '}
                {t('auth.and')}{' '}
                <Link href={`/${locale}/privacy`} className="text-[#FF7A45] font-semibold hover:underline">
                  {t('footer.privacy')}
                </Link>
              </span>
            </label>

            <Button
              type="submit"
              className="w-full h-12 bg-[#FF7A45] hover:bg-[#ff8f61] text-[#1F2937] font-semibold rounded-xl shadow-md shadow-[#FF7A45]/15 transition-all duration-200 hover:shadow-lg mt-2"
              disabled={isLoading || !acceptedTerms}
            >
              {isLoading ? 'Creating account...' : 'Register'}
            </Button>
          </form>

          <p className="text-center text-sm text-[#6B7280] mt-6">
            {t('auth.haveAccount')}{' '}
            <Link href={`/${locale}/login`} className="text-[#FF7A45] font-semibold hover:underline">
              {t('nav.login')}
            </Link>
          </p>

          <div className="mt-4 pt-4 border-t border-gray-100 text-center">
            <Link
              href={`/${locale}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#6B7280] hover:text-[#FF7A45] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('auth.backToHome')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
