'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/providers/auth-provider';
import { toast, Toaster } from 'sonner';
import { Moon, Sun, Bell, BellOff, Globe, Shield, Save, CheckCircle, Languages } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const currentLocale = useLocale();
  
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [language, setLanguage] = useState(currentLocale);
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    lessonReminders: true,
    certificateAlerts: true,
    marketingEmails: false,
    messageNotifications: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Load saved preferences from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' || 'light';
    const savedNotifications = localStorage.getItem('notifications');
    
    setTheme(savedTheme);
    applyTheme(savedTheme);
    
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }
  }, []);

  const applyTheme = (newTheme: 'light' | 'dark' | 'system') => {
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
    toast.success('Theme updated', {
      description: `Theme changed to ${newTheme}`,
      icon: newTheme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />,
    });
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    
    // Redirect to the same page with new locale
    const currentPath = window.location.pathname;
    const newPath = currentPath.replace(`/${currentLocale}`, `/${newLanguage}`);
    router.push(newPath);
    
    toast.success('Language changed', {
      description: `Language updated to ${newLanguage === 'en' ? 'English' : 'አማርኛ'}`,
      icon: <Languages className="w-4 h-4" />,
    });
  };

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const saveSettings = () => {
    setIsSaving(true);
    
    // Save to localStorage
    localStorage.setItem('notifications', JSON.stringify(notifications));
    localStorage.setItem('language', language);
    localStorage.setItem('theme', theme);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Settings saved!', {
        description: 'Your preferences have been updated.',
        icon: <CheckCircle className="w-4 h-4" />,
      });
    }, 500);
  };

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Toaster position="top-center" richColors />
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-14 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-[#FF7A45]">
            HobbyHub
          </Link>
          <div className="flex gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-[#FF7A45] dark:hover:text-[#FF7A45]">
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
            <TabsTrigger value="notifications" className="rounded-lg py-2.5 font-semibold text-sm">
              Notifications
            </TabsTrigger>
            <TabsTrigger value="language" className="rounded-lg py-2.5 font-semibold text-sm">
              Language
            </TabsTrigger>
            <TabsTrigger value="account" className="rounded-lg py-2.5 font-semibold text-sm">
              Account
            </TabsTrigger>
          </TabsList>

          {/* Appearance Tab */}
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
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Light Theme Option */}
                  <div
                    onClick={() => handleThemeChange('light')}
                    className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
                      theme === 'light' 
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

                  {/* Dark Theme Option */}
                  <div
                    onClick={() => handleThemeChange('dark')}
                    className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
                      theme === 'dark' 
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

                  {/* System Theme Option */}
                  <div
                    onClick={() => handleThemeChange('system')}
                    className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
                      theme === 'system' 
                        ? 'border-[#FF7A45] bg-orange-50 dark:bg-orange-900/20' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-[#FF7A45]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Globe className="w-6 h-6 text-green-500" />
                      {theme === 'system' && <CheckCircle className="w-5 h-5 text-[#FF7A45]" />}
                    </div>
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-1">System</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Follow your device settings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#FF7A45]" />
                  Notification Preferences
                </CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">
                  Manage how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                    <div>
                      <Label className="font-semibold text-gray-800 dark:text-white">Email Notifications</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receive important updates via email</p>
                    </div>
                    <Switch
                      checked={notifications.emailNotifications}
                      onCheckedChange={() => handleNotificationChange('emailNotifications')}
                      className="data-[state=checked]:bg-[#FF7A45]"
                    />
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                    <div>
                      <Label className="font-semibold text-gray-800 dark:text-white">Lesson Reminders</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Get reminders before your lessons start</p>
                    </div>
                    <Switch
                      checked={notifications.lessonReminders}
                      onCheckedChange={() => handleNotificationChange('lessonReminders')}
                      className="data-[state=checked]:bg-[#FF7A45]"
                    />
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                    <div>
                      <Label className="font-semibold text-gray-800 dark:text-white">Certificate Alerts</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when you earn a certificate</p>
                    </div>
                    <Switch
                      checked={notifications.certificateAlerts}
                      onCheckedChange={() => handleNotificationChange('certificateAlerts')}
                      className="data-[state=checked]:bg-[#FF7A45]"
                    />
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                    <div>
                      <Label className="font-semibold text-gray-800 dark:text-white">Message Notifications</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when you receive a message</p>
                    </div>
                    <Switch
                      checked={notifications.messageNotifications}
                      onCheckedChange={() => handleNotificationChange('messageNotifications')}
                      className="data-[state=checked]:bg-[#FF7A45]"
                    />
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div>
                      <Label className="font-semibold text-gray-800 dark:text-white">Marketing Emails</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receive promotions and updates</p>
                    </div>
                    <Switch
                      checked={notifications.marketingEmails}
                      onCheckedChange={() => handleNotificationChange('marketingEmails')}
                      className="data-[state=checked]:bg-[#FF7A45]"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    onClick={saveSettings} 
                    disabled={isSaving}
                    className="bg-[#FF7A45] hover:bg-[#ff8f61] text-white rounded-xl"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Preferences'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Language Tab */}
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
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      onClick={() => handleLanguageChange('en')}
                      className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
                        language === 'en' 
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
                      className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
                        language === 'am' 
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
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Note:</strong> Changing language will reload the page with your new language preference.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
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
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-white">Account Information</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Email: {user?.email}<br />
                        Role: {user?.roles?.[0] || 'Student'}
                      </p>
                    </div>
                    <Link href="/profile">
                      <Button variant="outline" className="rounded-xl">
                        Edit Profile
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="flex justify-between items-center py-3">
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">Privacy Policy</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Read our privacy policy and terms</p>
                  </div>
                  <Button variant="ghost" className="text-[#FF7A45]">
                    View →
                  </Button>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                  <Button variant="destructive" className="rounded-xl">
                    Delete Account
                  </Button>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    This action is permanent and cannot be undone.
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