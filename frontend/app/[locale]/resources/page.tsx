'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/providers/auth-provider';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { BookOpen, FileText, Download, PlayCircle, ExternalLink, Menu, X, LogOut, Home, Settings, MessageCircle, ShoppingBag, Trophy, LayoutDashboard } from 'lucide-react';
import { toast, Toaster } from 'sonner';

export default function ResourcesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const { data: resources, isLoading, refetch } = useQuery({
    queryKey: ['student-resources'],
    queryFn: async () => {
      const response = await api.get('/resources/student');
      return response.data;
    },
    enabled: !!user && user?.roles?.[0] === 'student',
  });

  const handleDownload = (id: number) => {
    const token = localStorage.getItem('token');
    window.open(`http://localhost:5001/api/resources/${id}/download?token=${token}`, '_blank');
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!user || user?.roles?.[0] !== 'student') {
    return null;
  }

  const getFileIcon = (fileType: string) => {
    switch(fileType) {
      case 'image': return <FileText className="w-4 h-4 text-[#FF7A45]" />;
      case 'video': return <PlayCircle className="w-4 h-4 text-[#FF7A45]" />;
      default: return <FileText className="w-4 h-4 text-[#FF7A45]" />;
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'resources', label: 'Resources', href: '/resources', icon: <FileText className="w-5 h-5" /> },
    { id: 'shop', label: 'Shop', href: '/shops', icon: <ShoppingBag className="w-5 h-5" /> },
    { id: 'messages', label: 'Messages', href: '/chat', icon: <MessageCircle className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', href: '/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1F2937]">
      <Toaster position="top-center" richColors />
      <Navbar alwaysWhite={true} />

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
              <Link
                key={item.id}
                href={item.href}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  item.id === 'resources'
                    ? 'bg-[#FF7A45]/10 text-[#FF7A45]'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content Area */}
      <main className="lg:ml-72 min-h-screen">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-14 py-12 pt-32 lg:pt-12">
          <div className="mb-10 text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold text-[#FF7A45] tracking-wider uppercase mb-2 block font-sans">Learning Center</span>
            <h1 className="text-3xl md:text-4xl lg:text-[48px] font-extrabold tracking-tight text-[#1F2937] mb-3">
              Your Resources
            </h1>
            <p className="text-base text-[#6B7280]">Files shared by your teachers</p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-pulse">Loading resources...</div>
            </div>
          ) : !resources || resources.length === 0 ? (
            <Card className="border border-gray-100 rounded-[24px] shadow-sm">
              <CardContent className="text-center py-16">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No resources shared yet</p>
                <p className="text-sm text-gray-400 mt-1">Teachers will share learning materials here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {resources.map((resource: any) => (
                <Card key={resource.id} className="border border-gray-100 bg-white rounded-[24px] hover:translate-y-[-6px] hover:shadow-xl hover:shadow-[#FF7A45]/5 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm">
                  <div className="p-6 pb-2">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[11px] font-bold text-[#FF7A45] bg-[#FFF2EB] px-3 py-1 rounded-full uppercase tracking-wider">
                        {resource.lesson?.title || 'General'}
                      </span>
                      <span className="text-[10px] text-gray-400 font-semibold uppercase">
                        {resource.fileType || 'Document'}
                      </span>
                    </div>
                    <CardTitle className="text-xl font-bold text-[#1F2937] leading-snug tracking-tight mb-2">
                      {resource.title}
                    </CardTitle>
                    {resource.description && (
                      <CardDescription className="text-sm text-[#6B7280] leading-relaxed">
                        {resource.description}
                      </CardDescription>
                    )}
                    <div className="mt-3 text-xs text-gray-400">
                      From: {resource.sender?.profile?.firstName} {resource.sender?.profile?.lastName}
                    </div>
                  </div>
                  <CardContent className="p-6 pt-4 border-t border-gray-50 flex items-center justify-between mt-auto">
                    <span className="text-xs text-[#6B7280] font-semibold flex items-center gap-1.5">
                      {getFileIcon(resource.fileType)}
                      {resource.fileName ? resource.fileName.substring(0, 20) : 'Resource File'}
                    </span>
                    <Button 
                      onClick={() => handleDownload(resource.id)}
                      className="bg-[#FF7A45] hover:bg-[#ff8f61] text-white font-semibold rounded-xl h-10 text-xs px-4 flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}