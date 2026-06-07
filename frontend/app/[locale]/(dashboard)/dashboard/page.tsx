'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/auth-provider';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
  BookOpen, ShoppingBag, Award, Calendar, LogOut, Trophy, 
  MessageCircle, Menu, X, LayoutDashboard, User, GraduationCap,
  Home, Settings, HelpCircle, BarChart3
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
    if (user?.roles?.includes('admin')) {
      router.push('/admin');
    }
    if (user?.roles?.includes('teacher')) {
      router.push('/teacher');
    }
    if (user?.roles?.includes('seller')) {
      router.push('/seller');
    }
  }, [user, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const { data: stats } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const response = await api.get('/dashboard/stats');
      return response.data;
    },
    enabled: !!user,
  });

  const { data: progress } = useQuery({
    queryKey: ['dashboardProgress'],
    queryFn: async () => {
      const response = await api.get('/dashboard/progress');
      return response.data;
    },
    enabled: !!user,
  });

  const { data: certificates } = useQuery({
    queryKey: ['certificates'],
    queryFn: async () => {
      const response = await api.get('/dashboard/certificates');
      return response.data;
    },
    enabled: !!user,
  });

  if (!user) {
    return null;
  }

  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'progress', label: 'My Progress', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'certificates', label: 'Certificates', icon: <Award className="w-5 h-5" /> },
    { id: 'recommendations', label: 'Recommendations', icon: <GraduationCap className="w-5 h-5" /> },
  ];

  const renderContent = () => {
    if (activeTab === 'dashboard') {
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border border-gray-100 rounded-xl">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-medium text-gray-500">Hobbies Discovered</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold text-gray-800">{stats?.hobbiesDiscovered || 0}</div>
            </CardContent>
          </Card>
          <Card className="border border-gray-100 rounded-xl">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-medium text-gray-500">Lessons Taken</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold text-gray-800">{stats?.registeredLessons || 0}</div>
            </CardContent>
          </Card>
          <Card className="border border-gray-100 rounded-xl">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-medium text-gray-500">Blog Posts</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold text-gray-800">{stats?.blogPostsWritten || 0}</div>
            </CardContent>
          </Card>
          <Card className="border border-gray-100 rounded-xl">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-medium text-gray-500">Orders</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold text-gray-800">{stats?.ordersPlaced || 0}</div>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (activeTab === 'progress') {
      return (
        <Card className="border border-gray-100 rounded-xl overflow-hidden">
          <CardHeader className="p-6">
            <CardTitle className="text-xl font-bold">Learning Progress</CardTitle>
            <CardDescription>Track your active courses and completion status</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            {progress?.allHobbies?.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No active courses. Explore classes below to begin!</p>
            ) : (
              progress?.allHobbies?.map((item: any) => (
                <div key={item.id} className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <span className="font-semibold text-gray-800">{item.hobby.name}</span>
                    <p className="text-xs text-[#FF7A45] font-medium">{item.hobby.category?.name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#FF7A45] rounded-full" style={{ width: `${(item.interestLevel / 5) * 100}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-gray-600">{item.interestLevel}/5</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      );
    }

    if (activeTab === 'certificates') {
      return (
        <Card className="border border-gray-100 rounded-xl overflow-hidden">
          <CardHeader className="p-6">
            <CardTitle className="text-xl font-bold">Your Certificates</CardTitle>
            <CardDescription>Lessons and tracks you've completed successfully</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            {certificates?.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No certificates earned yet. Attend live lessons to get certified!</p>
            ) : (
              <div className="space-y-3">
                {certificates?.map((cert: any) => (
                  <div key={cert.id} className="flex justify-between items-center p-4 border border-gray-100 rounded-xl bg-gray-50">
                    <div>
                      <p className="font-semibold text-gray-800">{cert.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{cert.hobby} • {cert.teacher}</p>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-lg" onClick={() => alert('Downloading certificate...')}>
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    if (activeTab === 'recommendations') {
      return (
        <Card className="border border-gray-100 rounded-xl overflow-hidden">
          <CardHeader className="p-6">
            <CardTitle className="text-xl font-bold">Recommended for You</CardTitle>
            <CardDescription>Personalized tracks based on your profile inputs</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            {!progress?.quizCompleted ? (
              <div className="text-center py-8 space-y-4">
                <p className="text-gray-600">Take our career interest quiz to get personalized track suggestions.</p>
                <Button className="bg-[#FF7A45] hover:bg-[#ff8f61] text-white rounded-xl">Take Interest Quiz</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {progress?.topHobbies?.map((item: any) => (
                  <div key={item.id} className="p-4 border border-gray-100 rounded-xl bg-gray-50">
                    <p className="font-semibold text-gray-800">{item.hobby.name}</p>
                    <p className="text-xs text-[#FF7A45] mt-0.5">{item.hobby.category?.name}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b z-20 px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-[#FF7A45]">HobbyHub</Link>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100">
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-72 bg-white border-r transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b">
            <Link href="/" className="text-2xl font-bold text-[#FF7A45]">HobbyHub</Link>
            <p className="text-sm text-gray-500 mt-1">Student Portal</p>
          </div>

          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FF7A45]/10 flex items-center justify-center">
                <span className="text-[#FF7A45] font-bold text-lg">
                  {user?.profile?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'S'}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-800">{user?.profile?.firstName} {user?.profile?.lastName}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'bg-[#FF7A45]/10 text-[#FF7A45]'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t space-y-2">
            <Link href="/" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
              <Home className="w-5 h-5" />
              <span className="font-medium">Home</span>
            </Link>
            <Link href="/hobbies" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
              <BookOpen className="w-5 h-5" />
              <span className="font-medium">Hobbies</span>
            </Link>
            <Link href="/shops" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
              <ShoppingBag className="w-5 h-5" />
              <span className="font-medium">Shop</span>
            </Link>
            <Link href="/chat" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
              <MessageCircle className="w-5 h-5" />
              <span className="font-medium">Messages</span>
            </Link>
            <Link href="/profile" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
              <User className="w-5 h-5" />
              <span className="font-medium">Profile</span>
            </Link>
            <Link href="/settings" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
              <Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </Link>
            <Link href="/help" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
              <HelpCircle className="w-5 h-5" />
              <span className="font-medium">Help</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="lg:ml-72 min-h-screen">
        <div className="p-6 md:p-8 pt-20 lg:pt-8">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Student Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back, {user?.profile?.firstName || 'Student'}!</p>
          </div>
          {renderContent()}

          {/* Quick Actions */}
          <div className="mt-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              <Button variant="outline" className="h-20 flex flex-col gap-2 rounded-xl" onClick={() => router.push('/hobbies')}>
                <BookOpen className="h-5 w-5 text-[#FF7A45]" />
                <span className="text-xs">Browse Hobbies</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2 rounded-xl" onClick={() => router.push('/my-lessons')}>
                <Calendar className="h-5 w-5 text-[#FF7A45]" />
                <span className="text-xs">My Lessons</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2 rounded-xl" onClick={() => router.push('/shops')}>
                <ShoppingBag className="h-5 w-5 text-[#FF7A45]" />
                <span className="text-xs">Visit Shop</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2 rounded-xl" onClick={() => router.push('/events')}>
                <Trophy className="h-5 w-5 text-[#FF7A45]" />
                <span className="text-xs">Events</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}