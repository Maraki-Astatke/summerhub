'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import api from '../../lib/api';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    try {
      await api.post(`/reset-password/${token}`, { password });
      setIsSuccess(true);
      toast.success('Password reset successfully!');
      setTimeout(() => router.push('/login'), 3000);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] text-[#1F2937] p-4">
        <Card className="w-full max-w-md border border-gray-100 bg-white rounded-[24px] shadow-sm overflow-hidden">
          <CardHeader className="text-center p-6 pb-4">
            <CardTitle className="text-2xl font-extrabold text-green-600">Success!</CardTitle>
            <CardDescription className="text-sm text-[#6B7280]">Your password has been changed</CardDescription>
          </CardHeader>
          <CardContent className="text-center p-6 pt-0 space-y-6">
            <p className="text-sm text-[#6B7280]">You can now log in with your new password details.</p>
            <Link href="/login">
              <Button className="w-full bg-[#FF7A45] hover:bg-[#ff8f61] text-white font-bold h-11 rounded-xl">
                Go to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] text-[#1F2937] p-4">
      <Card className="w-full max-w-md border border-gray-100 bg-white rounded-[24px] shadow-sm overflow-hidden">
        <CardHeader className="text-center p-6 pb-4">
          <Link href="/" className="inline-flex justify-center mb-4">
            <Image 
              src="/logo.png" 
              alt="HobbyHub Education" 
              width={160} 
              height={40} 
              priority 
              className="h-10 w-auto object-contain"
            />
          </Link>
          <CardTitle className="text-2xl font-extrabold text-[#1F2937]">Reset Password</CardTitle>
          <CardDescription className="text-sm text-[#6B7280]">Enter your new password below</CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password font-semibold text-xs text-gray-500 uppercase tracking-wider">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 px-4 rounded-xl border-gray-200 focus-visible:ring-[#FF7A45]"
              />
              <p className="text-xs text-[#6B7280]">Minimum 8 characters</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword font-semibold text-xs text-gray-500 uppercase tracking-wider">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-11 px-4 rounded-xl border-gray-200 focus-visible:ring-[#FF7A45]"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-[#FF7A45] hover:bg-[#ff8f61] text-white font-bold h-11 rounded-xl transition-all mt-4" 
              disabled={isLoading}
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}