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
  Users, BookOpen, Calendar, ShoppingBag, Award, Star, 
  Menu, X, LogOut, LayoutDashboard, Home, Settings, 
  UserPlus, Eye, CheckCircle, XCircle, Clock, TrendingUp, RefreshCw
} from 'lucide-react';

export default function ParentDashboardPage() {
  const router = useRouter();
  const { user, logout, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('children');
  const [linkEmail, setLinkEmail] = useState('');
  const [linkPhone, setLinkPhone] = useState('');
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);

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

  const linkChildMutation = useMutation({
    mutationFn: async (data: { childEmail?: string; childPhone?: string }) => {
      const response = await api.post('/parent/children/link', data);
      return response.data;
    },
    onSuccess: () => {
      setIsLinkDialogOpen(false);
      setLinkEmail('');
      setLinkPhone('');
      alert('Child linked successfully!');
      refetchChildren();
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Failed to link child');
    },
  });

  const handleLinkChild = () => {
    if (!linkEmail && !linkPhone) {
      alert('Please enter either email or phone number');
      return;
    }
    linkChildMutation.mutate({ childEmail: linkEmail || undefined, childPhone: linkPhone || undefined });
  };

  if (authLoading || childrenLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!user || !user?.roles?.includes('parent')) {
    return null;
  }

  const menuItems = [
    { id: 'children', label: 'My Children', icon: <Users className="w-5 h-5" /> },
    { id: 'progress', label: 'Progress', icon: <TrendingUp className="w-5 h-5" /> },
  ];

  const ChildrenView = () => (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle>My Children</CardTitle>
          <CardDescription>Select a child to view their progress</CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={() => refetchChildren()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {!children || children.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No children linked yet</p>
            <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Link Child
                </Button>
              </DialogTrigger>
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
                      placeholder="child@example.com"
                      value={linkEmail}
                      onChange={(e) => setLinkEmail(e.target.value)}
                    />
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
                    <Label htmlFor="childPhone">Child's Phone</Label>
                    <Input
                      id="childPhone"
                      type="tel"
                      placeholder="0912345678"
                      value={linkPhone}
                      onChange={(e) => setLinkPhone(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleLinkChild} disabled={linkChildMutation.isPending} className="w-full">
                    {linkChildMutation.isPending ? 'Linking...' : 'Link Child'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {children.map((child: any) => (
              <Card 
                key={child.id} 
                className={`cursor-pointer hover:shadow-md transition-shadow ${selectedChild?.id === child.id ? 'border-purple-500 border-2' : ''}`}
                onClick={() => {
                  setSelectedChild(child);
                  setActiveTab('progress');
                }}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{child.profile?.firstName} {child.profile?.lastName}</h3>
                      <p className="text-sm text-gray-500">{child.email}</p>
                    </div>
                    {selectedChild?.id === child.id ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow border-dashed"
              onClick={() => setIsLinkDialogOpen(true)}
            >
              <CardContent className="p-4 flex items-center justify-center gap-2">
                <UserPlus className="h-5 w-5 text-purple-600" />
                <span className="text-purple-600">Link Another Child</span>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const ProgressView = () => {
    if (!selectedChild) {
      return (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">Select a child first to view their progress</p>
            <Button className="mt-4" onClick={() => setActiveTab('children')}>
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
            <h2 className="text-2xl font-bold">{selectedChild.profile?.firstName} {selectedChild.profile?.lastName}</h2>
            <p className="text-gray-500">{selectedChild.email}</p>
          </div>
          <Button variant="outline" onClick={() => setActiveTab('children')}>
            Change Child
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Lessons Taken</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{childProgress?.progress?.totalLessonsRegistered || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Lessons Attended</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{childProgress?.progress?.lessonsAttended || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Hobbies Discovered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{childProgress?.progress?.hobbiesDiscovered || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Quiz Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {childProgress?.progress?.quizCompleted ? 'Yes' : 'No'}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="progress" className="space-y-4">
          <TabsList>
            <TabsTrigger value="progress">Learning Progress</TabsTrigger>
            <TabsTrigger value="lessons">Lesson History</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="progress">
            <Card>
              <CardHeader>
                <CardTitle>Learning Progress</CardTitle>
                <CardDescription>Track your child's learning journey</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span>Blog Posts Written</span>
                    <span className="font-bold">{childProgress?.progress?.blogPostsWritten || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span>Orders Placed</span>
                    <span className="font-bold">{childProgress?.progress?.ordersPlaced || 0}</span>
                  </div>
                </div>

                {childProgress?.topHobbies?.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-3">Top Hobbies</h3>
                    <div className="space-y-2">
                      {childProgress.topHobbies.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span>{item.hobby.name}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-purple-600 rounded-full" style={{ width: `${(item.interestLevel / 5) * 100}%` }} />
                            </div>
                            <span className="text-sm">{item.interestLevel}/5</span>
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
            <Card>
              <CardHeader>
                <CardTitle>Lesson History</CardTitle>
                <CardDescription>All lessons your child has registered for</CardDescription>
              </CardHeader>
              <CardContent>
                {!childLessons || childLessons.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No lessons registered yet</p>
                ) : (
                  <div className="space-y-3">
                    {childLessons.map((reg: any) => (
                      <div key={reg.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{reg.lesson.title}</h4>
                            <p className="text-sm text-gray-500">{reg.lesson.hobby?.name}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
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
                              <span className="flex items-center gap-1 text-green-600 text-sm">
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
            <Card>
              <CardHeader>
                <CardTitle>Recommended Hobbies</CardTitle>
                <CardDescription>Based on quiz results</CardDescription>
              </CardHeader>
              <CardContent>
                {!childQuizResults ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No quiz results yet</p>
                    <p className="text-sm text-gray-400 mt-2">Encourage your child to take the interest quiz</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {childQuizResults.recommendations?.map((hobby: any) => (
                      <div key={hobby.id} className="p-3 border rounded-lg">
                        <h4 className="font-semibold">{hobby.name}</h4>
                        <p className="text-sm text-gray-500">{hobby.category?.name}</p>
                        <p className="text-xs text-gray-400 mt-1">{hobby.description}</p>
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
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b z-20 px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-purple-600">HobbyHub Parent</Link>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100">
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-72 bg-white border-r transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b">
            <Link href="/" className="text-2xl font-bold text-purple-600">HobbyHub</Link>
            <p className="text-sm text-gray-500 mt-1">Parent Portal</p>
          </div>

          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-purple-600 font-bold text-lg">
                  {user?.profile?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'P'}
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
                  activeTab === item.id ? 'bg-purple-50 text-purple-600' : 'text-gray-600 hover:bg-gray-50'
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
            <Link href="/profile" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
              <Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Parent Dashboard</h1>
            <p className="text-gray-500 mt-1">Monitor your children's progress and activities</p>
          </div>
          {activeTab === 'children' ? <ChildrenView /> : <ProgressView />}
        </div>
      </div>
    </div>
  );
}