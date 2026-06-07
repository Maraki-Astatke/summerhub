'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/auth-provider';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { BookOpen, ShoppingBag, Award, Calendar, LogOut, Trophy, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (user?.roles?.includes('teacher')) {
      router.push('/teacher');
    }
  }, [user, router]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const response = await api.get('/dashboard/stats');
      return response.data;
    },
  });

  const { data: progress } = useQuery({
    queryKey: ['dashboardProgress'],
    queryFn: async () => {
      const response = await api.get('/dashboard/progress');
      return response.data;
    },
  });

  const { data: certificates } = useQuery({
    queryKey: ['certificates'],
    queryFn: async () => {
      const response = await api.get('/dashboard/certificates');
      return response.data;
    },
  });

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1F2937]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-14 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center focus:outline-none">
            <Image 
              src="/logo.png" 
              alt="HobbyHub Education" 
              width={150} 
              height={38} 
              priority 
              className="h-9 w-auto object-contain"
            />
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-[#6B7280]">
              Welcome, <span className="text-[#1F2937]">{user.profile?.firstName || user.email}</span>
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="text-[#6B7280] hover:text-[#FF7A45] rounded-xl font-semibold"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-14 py-12">
        <div className="mb-10">
          <span className="text-xs font-bold text-[#FF7A45] tracking-wider uppercase mb-2 block">Student Workspace</span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#1F2937]">
            My Dashboard
          </h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          <Card className="border border-gray-100 bg-white rounded-[24px] shadow-sm">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Tracks Discovered
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="text-3xl font-extrabold text-[#1F2937]">
                {stats?.hobbiesDiscovered || 0}
              </div>
            </CardContent>
          </Card>
          <Card className="border border-gray-100 bg-white rounded-[24px] shadow-sm">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Lessons Taken
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="text-3xl font-extrabold text-[#1F2937]">
                {stats?.registeredLessons || 0}
              </div>
            </CardContent>
          </Card>
          <Card className="border border-gray-100 bg-white rounded-[24px] shadow-sm">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Blog Posts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="text-3xl font-extrabold text-[#1F2937]">
                {stats?.blogPostsWritten || 0}
              </div>
            </CardContent>
          </Card>
          <Card className="border border-gray-100 bg-white rounded-[24px] shadow-sm">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Orders
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="text-3xl font-extrabold text-[#1F2937]">
                {stats?.ordersPlaced || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="progress" className="space-y-8">
          <TabsList className="bg-gray-100/70 p-1.5 rounded-xl border border-gray-100 max-w-md">
            <TabsTrigger value="progress" className="rounded-lg py-2.5 font-semibold text-sm">My Progress</TabsTrigger>
            <TabsTrigger value="certificates" className="rounded-lg py-2.5 font-semibold text-sm">Certificates</TabsTrigger>
            <TabsTrigger value="recommendations" className="rounded-lg py-2.5 font-semibold text-sm">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="progress">
            <Card className="border border-gray-100 bg-white rounded-[24px] shadow-sm overflow-hidden">
              <CardHeader className="p-6 pb-4">
                <CardTitle className="text-xl font-bold text-[#1F2937]">Learning Progress</CardTitle>
                <CardDescription className="text-sm text-[#6B7280]">Track your active courses and completion status.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-4">
                {progress?.allHobbies?.length === 0 ? (
                  <p className="text-sm text-gray-400 py-6 text-center">No active courses. Explore classes below to begin!</p>
                ) : (
                  progress?.allHobbies?.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 py-4 border-b border-gray-50 last:border-b-0"
                    >
                      <div>
                        <span className="font-bold text-[#1F2937] text-base">{item.hobby.name}</span>
                        <p className="text-xs font-semibold text-[#FF7A45]">
                          {item.hobby.category?.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#FF7A45] rounded-full"
                            style={{
                              width: `${(item.interestLevel / 5) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs font-bold text-gray-600">
                          {item.interestLevel}/5
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certificates">
            <Card className="border border-gray-100 bg-white rounded-[24px] shadow-sm overflow-hidden">
              <CardHeader className="p-6 pb-4">
                <CardTitle className="text-xl font-bold text-[#1F2937]">Your Certificates</CardTitle>
                <CardDescription className="text-sm text-[#6B7280]">Lessons and tracks you've completed successfully.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                {certificates?.length === 0 ? (
                  <p className="text-[#6B7280] text-center py-12 text-sm font-medium">
                    No certificates earned yet. Attend live lessons to get certified!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {certificates?.map((cert: any) => (
                      <div
                        key={cert.id}
                        className="flex justify-between items-center p-4 border border-gray-100 rounded-xl bg-[#FAFAFA]"
                      >
                        <div>
                          <p className="font-bold text-sm text-[#1F2937]">{cert.title}</p>
                          <p className="text-xs font-semibold text-[#6B7280] mt-0.5">
                            {cert.hobby} • {cert.teacher}
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="rounded-xl border-gray-200 text-xs font-bold hover:bg-gray-50 h-9"
                          onClick={() => alert('Downloading certificate...')}
                        >
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations">
            <Card className="border border-gray-100 bg-white rounded-[24px] shadow-sm overflow-hidden">
              <CardHeader className="p-6 pb-4">
                <CardTitle className="text-xl font-bold text-[#1F2937]">Recommended for You</CardTitle>
                <CardDescription className="text-sm text-[#6B7280]">Personalized tracks based on your profile inputs.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                {!progress?.quizCompleted ? (
                  <div className="text-center py-12 space-y-4">
                    <p className="text-[#6B7280] text-sm font-medium">
                      Take our career interest quiz to get personalized track suggestions.
                    </p>
                    <Button className="bg-[#FF7A45] hover:bg-[#ff8f61] text-[#1F2937] font-bold h-11 px-6 rounded-xl">
                      Take Interest Quiz
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {progress?.topHobbies?.map((item: any) => (
                      <div key={item.id} className="p-4 border border-gray-100 rounded-2xl bg-[#FAFAFA] flex flex-col justify-between">
                        <div>
                          <p className="font-bold text-sm text-[#1F2937]">{item.hobby.name}</p>
                          <p className="text-xs font-semibold text-[#FF7A45] mt-0.5">
                            {item.hobby.category?.name}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="mt-12">
          <h3 className="text-lg font-bold text-[#1F2937] mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            <Button
              variant="outline"
              className="h-24 flex flex-col justify-center items-center gap-2 rounded-2xl border-gray-150 hover:bg-gray-50 hover:text-[#FF7A45] hover:border-[#FF7A45]/30 transition-all font-bold text-xs"
              onClick={() => router.push('/hobbies')}
            >
              <BookOpen className="h-5 w-5 text-[#FF7A45]" />
              <span>Browse Catalog</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col justify-center items-center gap-2 rounded-2xl border-gray-150 hover:bg-gray-50 hover:text-[#FF7A45] hover:border-[#FF7A45]/30 transition-all font-bold text-xs"
              onClick={() => router.push('/my-lessons')}
            >
              <Calendar className="h-5 w-5 text-[#FF7A45]" />
              <span>My Lessons</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col justify-center items-center gap-2 rounded-2xl border-gray-150 hover:bg-gray-50 hover:text-[#FF7A45] hover:border-[#FF7A45]/30 transition-all font-bold text-xs"
              onClick={() => router.push('/shops')}
            >
              <ShoppingBag className="h-5 w-5 text-[#FF7A45]" />
              <span>Visit Shop</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col justify-center items-center gap-2 rounded-2xl border-gray-150 hover:bg-gray-50 hover:text-[#FF7A45] hover:border-[#FF7A45]/30 transition-all font-bold text-xs"
              onClick={() => router.push('/events')}
            >
              <Trophy className="h-5 w-5 text-[#FF7A45]" />
              <span>Talent Events</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col justify-center items-center gap-2 rounded-2xl border-gray-150 hover:bg-gray-50 hover:text-[#FF7A45] hover:border-[#FF7A45]/30 transition-all font-bold text-xs col-span-2 sm:col-span-1"
              onClick={() => router.push('/chat')}
            >
              <MessageCircle className="h-5 w-5 text-[#FF7A45]" />
              <span>Messages</span>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}