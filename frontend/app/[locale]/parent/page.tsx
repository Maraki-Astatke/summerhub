'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth-provider';
import api from '@/lib/api';
import { 
  Users, BookOpen, Calendar, Award, Star, 
  UserPlus, Eye, CheckCircle, Clock, TrendingUp, RefreshCw,
  ShoppingBag, LayoutDashboard, BarChart3, Heart, Package, FileText,
} from 'lucide-react';
import DashboardHeader from '@/components/DashboardHeader';

export default function ParentDashboardPage() {
  const router = useRouter();
  const { user, logout, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [linkEmail, setLinkEmail] = useState('');
  const [linkPhone, setLinkPhone] = useState('');
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkError, setLinkError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
    if (!authLoading && user && !user?.roles?.includes('parent')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const { data: children, refetch: refetchChildren, isLoading: childrenLoading } = useQuery({
    queryKey: ['parent-children'],
    queryFn: async () => {
      const response = await api.get('/parent/children');
      return response.data;
    },
    enabled: !!user && user?.roles?.includes('parent'),
  });

  const { data: childProgress, refetch: refetchProgress } = useQuery({
    queryKey: ['parent-child-progress', selectedChild?.id],
    queryFn: async () => {
      if (!selectedChild) return null;
      const response = await api.get(`/parent/child/${selectedChild.id}/progress`);
      return response.data;
    },
    enabled: !!selectedChild && !!user,
  });

  const { data: childLessons, refetch: refetchLessons } = useQuery({
    queryKey: ['parent-child-lessons', selectedChild?.id],
    queryFn: async () => {
      if (!selectedChild) return null;
      const response = await api.get(`/parent/child/${selectedChild.id}/lessons`);
      return response.data;
    },
    enabled: !!selectedChild && !!user,
  });

  const { data: childQuizResults, refetch: refetchQuiz } = useQuery({
    queryKey: ['parent-child-quiz', selectedChild?.id],
    queryFn: async () => {
      if (!selectedChild) return null;
      try {
        const response = await api.get(`/parent/child/${selectedChild.id}/quiz-results`);
        return response.data;
      } catch {
        return null;
      }
    },
    enabled: !!selectedChild && !!user,
  });

  const { data: allChildrenProgress } = useQuery({
    queryKey: ['parent-all-children-progress'],
    queryFn: async () => {
      if (!children || children.length === 0) return null;
      const progressData = await Promise.all(
        children.map(async (child: any) => {
          try {
            const response = await api.get(`/parent/child/${child.id}/progress`);
            return { ...response.data, child };
          } catch {
            return { child, progress: null };
          }
        })
      );
      return progressData;
    },
    enabled: !!children && children.length > 0 && !!user,
  });

  const linkChildMutation = useMutation({
    mutationFn: async (data: { childEmail?: string; childPhone?: string }) => {
      const response = await api.post('/parent/children/link', data);
      return response.data;
    },
    onSuccess: () => {
      setIsLinkDialogOpen(false);
      setLinkEmail('');
      setLinkPhone('');
      setLinkError('');
      alert('Child linked successfully!');
      refetchChildren();
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.error || 'Failed to link child';
      setLinkError(errorMsg);
      alert(errorMsg);
    },
  });

  const handleLinkChild = () => {
    setLinkError('');
    
    if (!linkEmail && !linkPhone) {
      setLinkError('Please enter either email or phone number');
      alert('Please enter either email or phone number');
      return;
    }
    
    if (linkPhone && !/^(09|07)[0-9]{8}$/.test(linkPhone)) {
      setLinkError('Phone must be in format: 09XXXXXXXX or 07XXXXXXXX');
      alert('Phone must be in format: 09XXXXXXXX or 07XXXXXXXX');
      return;
    }
    
    if (linkEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(linkEmail)) {
      setLinkError('Please enter a valid email address');
      alert('Please enter a valid email address');
      return;
    }
    
    const linkData: any = {};
    if (linkEmail) linkData.childEmail = linkEmail;
    if (linkPhone) linkData.childPhone = linkPhone;
    
    console.log('Linking child with data:', linkData);
    linkChildMutation.mutate(linkData);
  };

  const openLinkDialog = () => {
    setLinkEmail('');
    setLinkPhone('');
    setLinkError('');
    setIsLinkDialogOpen(true);
  };

  if (authLoading || childrenLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF7A45] mx-auto"></div>
          <p className="mt-4 text-base text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !user?.roles?.includes('parent')) {
    return null;
  }

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'children', label: 'My Children', icon: <Users className="w-5 h-5" /> },
    { id: 'progress', label: 'Progress', icon: <TrendingUp className="w-5 h-5" /> },
    { id: 'shop', label: 'Shop', icon: <ShoppingBag className="w-5 h-5" /> },
  ];

  // ============================================
  // OVERVIEW / ANALYTICS VIEW
  // ============================================
  const OverviewView = () => {
    const totalChildren = children?.length || 0;
    const totalLessons = allChildrenProgress?.reduce((sum: number, item: any) => {
      return sum + (item.progress?.progress?.totalLessonsRegistered || 0);
    }, 0) || 0;
    const totalAttended = allChildrenProgress?.reduce((sum: number, item: any) => {
      return sum + (item.progress?.progress?.lessonsAttended || 0);
    }, 0) || 0;
    const totalHobbies = allChildrenProgress?.reduce((sum: number, item: any) => {
      return sum + (item.progress?.progress?.hobbiesDiscovered || 0);
    }, 0) || 0;
    const completedQuiz = allChildrenProgress?.filter((item: any) => 
      item.progress?.progress?.quizCompleted
    ).length || 0;

    return (
      <div className="space-y-6">
        {/* Stats Overview - All Orange Icons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Children</p>
                  <p className="text-2xl font-bold dark:text-white">{totalChildren}</p>
                </div>
                <div className="p-3 bg-[#FF7A45]/10 rounded-xl">
                  <Users className="h-6 w-6 text-[#FF7A45]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Lessons Taken</p>
                  <p className="text-2xl font-bold dark:text-white">{totalLessons}</p>
                </div>
                <div className="p-3 bg-[#FF7A45]/10 rounded-xl">
                  <BookOpen className="h-6 w-6 text-[#FF7A45]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Attended</p>
                  <p className="text-2xl font-bold dark:text-white">{totalAttended}</p>
                </div>
                <div className="p-3 bg-[#FF7A45]/10 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-[#FF7A45]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Hobbies Found</p>
                  <p className="text-2xl font-bold dark:text-white">{totalHobbies}</p>
                </div>
                <div className="p-3 bg-[#FF7A45]/10 rounded-xl">
                  <Heart className="h-6 w-6 text-[#FF7A45]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Children Progress Table */}
        <Card className="border-0 shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold dark:text-white">Children Progress</CardTitle>
                <CardDescription className="text-base dark:text-gray-400">Overview of all your children's learning activities</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setActiveTab('children')}
                className="dark:border-gray-700 dark:text-gray-200"
              >
                <Users className="h-4 w-4 mr-2" />
                Manage Children
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!children || children.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No children linked yet</p>
                <Button onClick={openLinkDialog} className="mt-4 bg-[#FF7A45] hover:bg-[#ff8f61] text-white">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Link Your First Child
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Child</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Email</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Lessons</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Attended</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Hobbies</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Quiz</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {children.map((child: any) => {
                      const childData = allChildrenProgress?.find((item: any) => item.child.id === child.id);
                      const progress = childData?.progress?.progress;
                      return (
                        <tr key={child.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#FF7A45]/10 flex items-center justify-center">
                                <span className="text-[#FF7A45] font-bold text-sm">
                                  {child.profile?.firstName?.[0] || child.email?.[0]?.toUpperCase() || 'S'}
                                </span>
                              </div>
                              <span className="font-medium dark:text-white">
                                {child.profile?.firstName} {child.profile?.lastName}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{child.email}</td>
                          <td className="py-3 px-4 text-center font-semibold dark:text-white">
                            {progress?.totalLessonsRegistered || 0}
                          </td>
                          <td className="py-3 px-4 text-center font-semibold dark:text-white">
                            {progress?.lessonsAttended || 0}
                          </td>
                          <td className="py-3 px-4 text-center font-semibold dark:text-white">
                            {progress?.hobbiesDiscovered || 0}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {progress?.quizCompleted ? (
                              <CheckCircle className="h-5 w-5 text-[#FF7A45] mx-auto" />
                            ) : (
                              <span className="text-gray-400 dark:text-gray-500">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedChild(child);
                                setActiveTab('progress');
                              }}
                              className="text-[#FF7A45] hover:text-[#ff8f61] hover:bg-[#FF7A45]/10"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Link Card */}
        {children && children.length > 0 && (
          <Card 
            className="border-2 border-dashed dark:border-gray-700 hover:border-[#FF7A45] transition-all cursor-pointer dark:bg-gray-800"
            onClick={openLinkDialog}
          >
            <CardContent className="p-6 flex items-center justify-center gap-3">
              <UserPlus className="h-5 w-5 text-[#FF7A45]" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Link Another Child</span>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // ============================================
  // CHILDREN VIEW
  // ============================================
  const ChildrenView = () => (
    <Card className="border-0 shadow-sm dark:bg-gray-800 dark:border-gray-700">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle className="text-xl font-bold dark:text-white">My Children</CardTitle>
          <CardDescription className="text-base dark:text-gray-400">Select a child to view their progress</CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={() => refetchChildren()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {!children || children.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">No children linked yet</p>
            <Button onClick={openLinkDialog} className="bg-[#FF7A45] hover:bg-[#ff8f61] text-white">
              <UserPlus className="h-4 w-4 mr-2" />
              Link Child
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {children.map((child: any) => (
              <Card 
                key={child.id} 
                className={`cursor-pointer hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700 ${selectedChild?.id === child.id ? 'border-[#FF7A45] border-2 dark:border-[#FF7A45]' : ''}`}
                onClick={() => {
                  setSelectedChild(child);
                  setActiveTab('progress');
                }}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold dark:text-white">{child.profile?.firstName} {child.profile?.lastName}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{child.email}</p>
                    </div>
                    {selectedChild?.id === child.id ? (
                      <CheckCircle className="h-5 w-5 text-[#FF7A45]" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow border-dashed dark:bg-gray-800 dark:border-gray-700"
              onClick={openLinkDialog}
            >
              <CardContent className="p-4 flex items-center justify-center gap-2">
                <UserPlus className="h-5 w-5 text-[#FF7A45] dark:text-[#FF7A45]" />
                <span className="text-[#FF7A45] dark:text-[#FF7A45]">Link Another Child</span>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // ============================================
  // PROGRESS VIEW
  // ============================================
  const ProgressView = () => {
    if (!selectedChild) {
      return (
        <Card className="border-0 shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Select a child first to view their progress</p>
            <Button className="mt-4 bg-[#FF7A45] hover:bg-[#ff8f61] text-white" onClick={() => setActiveTab('children')}>
              Go to My Children
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold dark:text-white">{selectedChild.profile?.firstName} {selectedChild.profile?.lastName}</h2>
            <p className="text-gray-500 dark:text-gray-400">{selectedChild.email}</p>
          </div>
          <Button variant="outline" onClick={() => setActiveTab('children')} className="dark:border-gray-700 dark:text-gray-200">
            Change Child
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Lessons Taken</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold dark:text-white">{childProgress?.progress?.totalLessonsRegistered || 0}</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Lessons Attended</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold dark:text-white">{childProgress?.progress?.lessonsAttended || 0}</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Hobbies Discovered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold dark:text-white">{childProgress?.progress?.hobbiesDiscovered || 0}</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Quiz Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold dark:text-white">
                {childProgress?.progress?.quizCompleted ? 'Yes' : 'No'}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="progress" className="space-y-4">
          <TabsList className="dark:bg-gray-800">
            <TabsTrigger value="progress" className="dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white">Learning Progress</TabsTrigger>
            <TabsTrigger value="lessons" className="dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white">Lesson History</TabsTrigger>
            <TabsTrigger value="recommendations" className="dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="progress">
            <Card className="border-0 shadow-sm dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-xl font-bold dark:text-white">Learning Progress</CardTitle>
                <CardDescription className="text-base dark:text-gray-400">Track your child's learning journey</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
                    <span className="dark:text-gray-300">Blog Posts Written</span>
                    <span className="font-bold dark:text-white">{childProgress?.progress?.blogPostsWritten || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
                    <span className="dark:text-gray-300">Orders Placed</span>
                    <span className="font-bold dark:text-white">{childProgress?.progress?.ordersPlaced || 0}</span>
                  </div>
                </div>

                {childProgress?.topHobbies?.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-3 dark:text-white">Top Hobbies</h3>
                    <div className="space-y-2">
                      {childProgress.topHobbies.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-900/50 rounded">
                          <span className="dark:text-gray-200">{item.hobby.name}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div className="h-full bg-[#FF7A45] dark:bg-[#FF7A45] rounded-full" style={{ width: `${(item.interestLevel / 5) * 100}%` }} />
                            </div>
                            <span className="text-sm dark:text-gray-400">{item.interestLevel}/5</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lessons">
            <Card className="border-0 shadow-sm dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-xl font-bold dark:text-white">Lesson History</CardTitle>
                <CardDescription className="text-base dark:text-gray-400">All lessons your child has registered for</CardDescription>
              </CardHeader>
              <CardContent>
                {!childLessons || childLessons.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">No lessons registered yet</p>
                ) : (
                  <div className="space-y-3">
                    {childLessons.map((reg: any) => (
                      <div key={reg.id} className="border dark:border-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold dark:text-white">{reg.lesson.title}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{reg.lesson.hobby?.name}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(reg.lesson.dateTime).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(reg.lesson.dateTime).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                          <div>
                            {reg.attended ? (
                              <span className="flex items-center gap-1 text-[#FF7A45] text-sm">
                                <CheckCircle className="h-4 w-4" />
                                Attended
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-yellow-600 text-sm">
                                <Clock className="h-4 w-4" />
                                Pending
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations">
            <Card className="border-0 shadow-sm dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-xl font-bold dark:text-white">Recommended Hobbies</CardTitle>
                <CardDescription className="text-base dark:text-gray-400">Based on quiz results</CardDescription>
              </CardHeader>
              <CardContent>
                {!childQuizResults ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No quiz results yet</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Encourage your child to take the interest quiz</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {childQuizResults.recommendations?.map((rec: any) => (
                      <div key={rec.id} className="p-4 border dark:border-gray-700 rounded-xl bg-gradient-to-br from-[#FFF2EB] to-white dark:from-[#FF7A45]/10 dark:to-gray-800 hover:shadow-md transition-all duration-300">
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-gray-800 dark:text-gray-100">{rec.hobby?.name}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{rec.hobby?.category?.name}</p>
                            {rec.reason && (
                              <div className="mt-3 p-3 bg-[#FFF2EB] dark:bg-[#FF7A45]/10 rounded-lg border border-[#FFF2EB] dark:border-[#FF7A45]/30">
                                <p className="text-sm text-[#FF7A45] dark:text-[#ff8f61] italic">"{rec.reason}"</p>
                              </div>
                            )}
                            <div className="mt-3">
                              <p className="text-xs text-gray-400 dark:text-gray-500">
                                Recommended by: {rec.admin?.profile?.firstName} {rec.admin?.profile?.lastName}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-[#1F2937]">
      <DashboardHeader
        user={user}
        logout={logout}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        roleName="Parent"
      />

      <div className={`fixed top-16 bottom-0 left-0 z-30 w-72 bg-white dark:bg-gray-800 border-r dark:border-gray-700 transform transition-transform duration-300 lg:translate-x-0 overflow-y-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <nav className="flex-1 p-4 pt-5 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-base font-medium ${
                  activeTab === item.id
                    ? 'bg-[#FF7A45]/10 text-[#FF7A45] shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="lg:ml-72 pt-16 min-h-screen">
        <div className="p-6 md:p-8">
          <div className="mb-7">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Parent Dashboard</h1>
            <p className="text-base text-gray-500 dark:text-gray-400 mt-1">Monitor your children's progress and activities</p>
          </div>
          {activeTab === 'overview' && <OverviewView />}
          {activeTab === 'children' && <ChildrenView />}
          {activeTab === 'progress' && <ProgressView />}
          {activeTab === 'shop' && (
            <div className="text-center py-12">
              <ShoppingBag className="h-16 w-16 text-[#FF7A45] mx-auto mb-4" />
              <h2 className="text-2xl font-bold dark:text-white mb-2">Shop</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Browse and purchase hobby supplies for your children</p>
              <Link href="/shops">
                <Button className="bg-[#FF7A45] hover:bg-[#ff8f61] text-white">Go to Shop</Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isLinkDialogOpen} onOpenChange={(open) => {
        setIsLinkDialogOpen(open);
        if (!open) {
          setLinkEmail('');
          setLinkPhone('');
          setLinkError('');
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link a Child</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="childEmail">Child's Email</Label>
              <Input
                id="childEmail"
                type="email"
                placeholder="student@example.com"
                value={linkEmail}
                onChange={(e) => setLinkEmail(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">Enter the student's email address</p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or</span>
              </div>
            </div>
            <div>
              <Label htmlFor="childPhone">Child's Phone Number</Label>
              <Input
                id="childPhone"
                type="tel"
                placeholder="0912345678"
                value={linkPhone}
                onChange={(e) => setLinkPhone(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">Ethiopian format: 09XXXXXXXX or 07XXXXXXXX</p>
            </div>
            {linkError && (
              <p className="text-sm text-red-500 text-center">{linkError}</p>
            )}
            <Button 
              onClick={handleLinkChild} 
              disabled={linkChildMutation.isPending} 
              className="w-full bg-[#FF7A45] hover:bg-[#ff8f61] text-white"
            >
              {linkChildMutation.isPending ? 'Linking...' : 'Link Child'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}