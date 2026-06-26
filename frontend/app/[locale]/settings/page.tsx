'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/providers/auth-provider';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast, Toaster } from 'sonner';
import {
  Moon, Sun, Bell, Globe, Shield, Save, CheckCircle,
  Languages, User, Mail, Phone, MapPin, School, Calendar,
  GraduationCap, Briefcase, Building2, LogOut
} from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading, logout } = useAuth();
  const currentLocale = useLocale();
  const { theme, setTheme } = useTheme();

  const [language, setLanguage] = useState(currentLocale);
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const response = await api.get('/profile');
      return response.data;
    },
    enabled: !!user,
  });

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    toast.success('Theme updated', {
      description: `Theme changed to ${newTheme}`,
    });
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);

    const currentPath = window.location.pathname;
    const newPath = currentPath.replace(`/${currentLocale}`, `/${newLanguage}`);
    router.push(newPath);

    toast.success('Language changed', {
      description: `Language updated to ${newLanguage === 'en' ? 'English' : 'አማርኛ'}`,
    });
  };

  const saveSettings = () => {
    setIsSaving(true);
    localStorage.setItem('language', language);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Settings saved!', {
        description: 'Your preferences have been updated.',
      });
    }, 500);
  };

  const handleLogout = () => {
    queryClient.clear();
    logout();
    router.push('/');
  };

  const userRole = user?.roles?.[0] || 'student';
  const isStudent = userRole === 'student';
  const isTeacher = userRole === 'teacher';
  const isSeller = userRole === 'seller';
  const isAdmin = userRole === 'admin';
  const isParent = userRole === 'parent';

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Toaster position="top-center" richColors />

      <header className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-14 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-[#FF7A45]">
            HobbyHub
          </Link>
          <div className="flex gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-[#FF7A45]">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-4 md:px-10 lg:px-14 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account preferences</p>
        </div>

        <Tabs defaultValue="appearance" className="space-y-6">
          <TabsList className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            <TabsTrigger value="appearance" className="rounded-lg py-2.5 font-semibold text-sm">
              Appearance
            </TabsTrigger>
            <TabsTrigger value="language" className="rounded-lg py-2.5 font-semibold text-sm">
              Language
            </TabsTrigger>
            <TabsTrigger value="account" className="rounded-lg py-2.5 font-semibold text-sm">
              Account
            </TabsTrigger>
          </TabsList>

          {}
          <TabsContent value="appearance">
            <Card className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <Sun className="w-5 h-5 text-[#FF7A45]" />
                  Theme Preference
                </CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">
                  Choose how HobbyHub looks on your device
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    onClick={() => handleThemeChange('light')}
                    className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${theme === 'light'
                      ? 'border-[#FF7A45] bg-orange-50 dark:bg-orange-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-[#FF7A45]/50'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Sun className="w-6 h-6 text-yellow-500" />
                      {theme === 'light' && <CheckCircle className="w-5 h-5 text-[#FF7A45]" />}
                    </div>
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-1">Light</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Light mode for bright environments</p>
                  </div>

                  <div
                    onClick={() => handleThemeChange('dark')}
                    className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${theme === 'dark'
                      ? 'border-[#FF7A45] bg-orange-50 dark:bg-orange-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-[#FF7A45]/50'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Moon className="w-6 h-6 text-indigo-500" />
                      {theme === 'dark' && <CheckCircle className="w-5 h-5 text-[#FF7A45]" />}
                    </div>
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-1">Dark</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Dark mode for reduced eye strain</p>
                  </div>

                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {}
          <TabsContent value="language">
            <Card className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <Languages className="w-5 h-5 text-[#FF7A45]" />
                  Language Settings
                </CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">
                  Choose your preferred language
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    onClick={() => handleLanguageChange('en')}
                    className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${language === 'en'
                      ? 'border-[#FF7A45] bg-orange-50 dark:bg-orange-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-[#FF7A45]/50'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-white text-lg">English</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">English (US)</p>
                      </div>
                      {language === 'en' && <CheckCircle className="w-5 h-5 text-[#FF7A45]" />}
                    </div>
                  </div>

                  <div
                    onClick={() => handleLanguageChange('am')}
                    className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${language === 'am'
                      ? 'border-[#FF7A45] bg-orange-50 dark:bg-orange-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-[#FF7A45]/50'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-white text-lg">አማርኛ</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Amharic</p>
                      </div>
                      {language === 'am' && <CheckCircle className="w-5 h-5 text-[#FF7A45]" />}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {}
          <TabsContent value="account">
            <Card className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#FF7A45]" />
                  Account Settings
                </CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">
                  Manage your account security and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {}
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-white">Account Information</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Email: {user?.email}<br />
                        Role: {userRole}
                      </p>
                    </div>
                    <Link href="/profile">
                      <Button variant="outline" className="rounded-xl">
                        Edit Full Profile
                      </Button>
                    </Link>
                  </div>
                </div>

                {}
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Profile Summary</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
                        <p className="font-medium text-gray-800 dark:text-white">
                          {profile?.profile?.firstName || 'Not set'} {profile?.profile?.lastName || ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                        <p className="font-medium text-gray-800 dark:text-white">{user?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                        <p className="font-medium text-gray-800 dark:text-white">
                          {profile?.phone || 'Not provided'}
                        </p>
                      </div>
                    </div>

                    {isStudent && profile?.profile?.grade && (
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Grade</p>
                          <p className="font-medium text-gray-800 dark:text-white">{profile.profile.grade}</p>
                        </div>
                      </div>
                    )}

                    {isTeacher && profile?.profile?.profession && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Profession</p>
                          <p className="font-medium text-gray-800 dark:text-white">{profile.profile.profession}</p>
                        </div>
                      </div>
                    )}

                    {(isTeacher || isSeller) && profile?.profile?.company && (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Organization</p>
                          <p className="font-medium text-gray-800 dark:text-white">{profile.profile.company}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {isStudent && profile?.profile?.age && (
                    <div className="flex items-center gap-2 mt-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Age</p>
                        <p className="font-medium text-gray-800 dark:text-white">{profile.profile.age}</p>
                      </div>
                    </div>
                  )}

                  {isStudent && profile?.profile?.schoolName && (
                    <div className="flex items-center gap-2 mt-2">
                      <School className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">School</p>
                        <p className="font-medium text-gray-800 dark:text-white">{profile.profile.schoolName}</p>
                      </div>
                    </div>
                  )}

                  {profile?.profile?.city && (
                    <div className="flex items-center gap-2 mt-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                        <p className="font-medium text-gray-800 dark:text-white">{profile.profile.city}</p>
                      </div>
                    </div>
                  )}

                  {profile?.profile?.bio && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">About Me</p>
                      <p className="text-gray-700 dark:text-gray-300">{profile.profile.bio}</p>
                    </div>
                  )}
                </div>

                {}
                <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                  <Button
                    onClick={handleLogout}
                    variant="destructive"
                    className="rounded-xl"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    This will log you out of your account.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
