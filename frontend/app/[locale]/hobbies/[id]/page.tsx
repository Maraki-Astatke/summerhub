'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth-provider';
import { useTranslations } from 'next-intl';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { Calendar, User, Clock, Users, Heart, BookOpen, CheckCircle, XCircle, LogOut } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function HobbyDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const t = useTranslations();
  const [showUnregisterDialog, setShowUnregisterDialog] = useState(false);

  const { data: hobby, isLoading: hobbyLoading } = useQuery({
    queryKey: ['hobby', id],
    queryFn: async () => {
      const response = await api.get(`/hobbies/${id}`);
      return response.data;
    },
  });

  const { data: isRegistered, refetch: refetchRegistration } = useQuery({
    queryKey: ['hobby-registered', id],
    queryFn: async () => {
      if (!user || user.roles?.[0] !== 'student') return false;
      const response = await api.get(`/hobbies/${id}/is-registered`);
      return response.data.isRegistered;
    },
    enabled: !!user && !!id,
  });

  const { data: lessons, refetch: refetchLessons } = useQuery({
    queryKey: ['lessons', id],
    queryFn: async () => {
      const response = await api.get(`/lessons?hobbyId=${id}&upcoming=true`);
      return response.data.data;
    },
    enabled: !!isRegistered,
  });

  const registerForHobbyMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/hobbies/${id}/register`);
      return response.data;
    },
    onSuccess: () => {
      refetchRegistration();
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      toast.success('Successfully Registered!', {
        description: `You are now registered for ${hobby?.name}. You can now book lessons!`,
        duration: 4000,
        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      });
    },
    onError: (error: any) => {
      toast.error('Registration Failed', {
        description: error.response?.data?.error || 'Failed to register for hobby',
        duration: 4000,
        icon: <XCircle className="w-5 h-5 text-red-500" />,
      });
    },
  });

  const unregisterFromHobbyMutation = useMutation({
    mutationFn: async () => {
      const response = await api.delete(`/hobbies/${id}/unregister`);
      return response.data;
    },
    onSuccess: () => {
      refetchRegistration();
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['lessons', id] });
      toast.success('Successfully Unregistered', {
        description: `You have been unregistered from ${hobby?.name}.`,
        duration: 4000,
        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      });
      setShowUnregisterDialog(false);
    },
    onError: (error: any) => {
      toast.error('Unregistration Failed', {
        description: error.response?.data?.error || 'Failed to unregister from hobby',
        duration: 4000,
        icon: <XCircle className="w-5 h-5 text-red-500" />,
      });
    },
  });

  const registerForLessonMutation = useMutation({
    mutationFn: async (lessonId: number) => {
      const response = await api.post(`/lessons/${lessonId}/register`);
      return response.data;
    },
    onSuccess: (data, lessonId) => {
      refetchLessons();
      toast.success('Lesson Booked!', {
        description: 'You have successfully registered for this lesson.',
        duration: 4000,
        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      });
    },
    onError: (error: any) => {
      toast.error('Booking Failed', {
        description: error.response?.data?.error || 'Failed to register for lesson',
        duration: 4000,
        icon: <XCircle className="w-5 h-5 text-red-500" />,
      });
    },
  });

  const handleRegisterForHobby = () => {
    if (!user) {
      toast.info('Login Required', {
        description: 'Please login to register for this hobby.',
        duration: 3000,
      });
      router.push('/login');
      return;
    }
    registerForHobbyMutation.mutate();
  };

  const handleUnregisterForHobby = () => {
    setShowUnregisterDialog(true);
  };

  const confirmUnregister = () => {
    unregisterFromHobbyMutation.mutate();
  };

  const handleRegisterForLesson = (lessonId: number) => {
    if (!user) {
      toast.info('Login Required', {
        description: 'Please login to book a lesson.',
        duration: 3000,
      });
      router.push('/login');
      return;
    }
    registerForLessonMutation.mutate(lessonId);
  };

  if (hobbyLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center font-semibold text-gray-500">Loading details...</div>
      </div>
    );
  }

  if (!hobby) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center max-w-sm px-6 py-8 bg-white rounded-[24px] shadow-sm border border-gray-100">
          <p className="text-gray-500 font-medium mb-4">Course or activity not found</p>
          <Link href="/hobbies">
            <Button className="bg-[#FF7A45] hover:bg-[#ff8f61] rounded-xl text-white font-bold h-11 px-6">
              Back to Catalog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isStudent = user?.roles?.[0] === 'student';

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1F2937]">
      <Toaster position="top-center" richColors />
      <Navbar alwaysWhite={true} />

      <main className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-14 py-12 pt-32">
        {}
        <div className="bg-white rounded-[24px] border border-gray-100 p-8 md:p-10 shadow-sm mb-10 relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] rounded-full bg-[#FFF2EB] filter blur-3xl opacity-60 pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex flex-wrap gap-2.5 mb-4">
              {hobby.category && (
                <span className="text-xs font-bold text-[#FF7A45] bg-[#FFF2EB] px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                  {hobby.category.name}
                </span>
              )}
              {hobby.ageGroup && (
                <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                  Ages {hobby.ageGroup}
                </span>
              )}
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-[48px] font-extrabold tracking-tight text-[#1F2937] leading-tight mb-4">
              {hobby.name}
            </h1>
            <p className="text-base md:text-lg text-[#6B7280] leading-relaxed max-w-3xl mb-6">
              {hobby.description}
            </p>

            {}
            <div className="flex flex-wrap gap-4 items-center">
              {}
              {isStudent && !isRegistered && (
                <Button 
                  onClick={handleRegisterForHobby}
                  disabled={registerForHobbyMutation.isPending}
                  className="bg-[#FF7A45] hover:bg-[#ff8f61] text-white font-bold rounded-xl h-12 px-8 shadow-md hover:shadow-lg transition-all"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  {registerForHobbyMutation.isPending ? 'Registering...' : 'Register for this Hobby'}
                </Button>
              )}

              {}
              {isStudent && isRegistered && (
                <div className="flex flex-wrap items-center gap-4">
                  <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full border border-green-200 shadow-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">You are registered for this hobby!</span>
                  </div>
                  <Button 
                    onClick={handleUnregisterForHobby}
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-xl h-10 px-4 transition-all"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Unregister
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {}
        {(!isStudent || isRegistered) ? (
          <Tabs defaultValue="lessons" className="space-y-8">
            <TabsList className="bg-gray-100/70 p-1.5 rounded-xl border border-gray-100 max-w-md">
              <TabsTrigger value="lessons" className="rounded-lg py-2.5 font-semibold text-sm">
                <BookOpen className="w-4 h-4 mr-2" />
                Upcoming Lessons
              </TabsTrigger>
              <TabsTrigger value="about" className="rounded-lg py-2.5 font-semibold text-sm">
                Course Overview
              </TabsTrigger>
              {user && isRegistered && (
                <TabsTrigger value="my-progress" className="rounded-lg py-2.5 font-semibold text-sm">
                  My Progress
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="lessons">
              {!lessons || lessons.length === 0 ? (
                <Card className="rounded-[24px] border-gray-100 shadow-sm">
                  <CardContent className="text-center py-16">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium mb-1">No lessons scheduled currently</p>
                    <p className="text-sm text-gray-400">Please check back in a few days or contact support.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {lessons?.map((lesson: any) => (
                    <Card key={lesson.id} className="rounded-[24px] border border-gray-100 bg-white hover:shadow-lg transition-all duration-300 overflow-hidden shadow-sm">
                      <CardHeader className="p-6 pb-4">
                        <CardTitle className="text-xl font-bold text-[#1F2937] tracking-tight">{lesson.title}</CardTitle>
                        <CardDescription className="text-sm text-[#6B7280] mt-1.5 line-clamp-2">{lesson.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-6 pt-0 space-y-4">
                        <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-100">
                          <div className="flex items-center gap-2.5 text-sm text-[#6B7280]">
                            <User className="h-4.5 w-4.5 text-[#FF7A45]" />
                            <span className="truncate">
                              {lesson.teacher?.profile?.firstName} {lesson.teacher?.profile?.lastName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2.5 text-sm text-[#6B7280]">
                            <Calendar className="h-4.5 w-4.5 text-[#FF7A45]" />
                            <span>{new Date(lesson.dateTime).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2.5 text-sm text-[#6B7280]">
                            <Clock className="h-4.5 w-4.5 text-[#FF7A45]" />
                            <span>{lesson.durationMinutes} mins</span>
                          </div>
                          <div className="flex items-center gap-2.5 text-sm text-[#6B7280]">
                            <Users className="h-4.5 w-4.5 text-[#FF7A45]" />
                            <span>{lesson.registrations?.length || 0} / {lesson.maxStudents} joined</span>
                          </div>
                        </div>
                        <Button 
                          className="w-full h-11 bg-[#FF7A45] hover:bg-[#ff8f61] text-white font-semibold rounded-xl transition-all duration-200"
                          onClick={() => handleRegisterForLesson(lesson.id)}
                          disabled={lesson.registrations?.length >= lesson.maxStudents || registerForLessonMutation.isPending}
                        >
                          {lesson.registrations?.length >= lesson.maxStudents 
                            ? 'Class Full' 
                            : registerForLessonMutation.isPending ? 'Booking...' : 'Book Class Spot'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="about">
              <Card className="rounded-[24px] border-gray-100 bg-white p-2 shadow-sm">
                <CardContent className="p-6 space-y-8">
                  <div>
                    <h3 className="text-xl font-bold text-[#1F2937] mb-3">About this course</h3>
                    <p className="text-base text-[#6B7280] leading-relaxed">{hobby.description}</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-8 pt-4">
                    <div>
                      <h4 className="text-lg font-bold text-[#1F2937] mb-3">What you will learn</h4>
                      <ul className="space-y-2.5 text-sm text-[#6B7280]">
                        <li className="flex gap-2.5 items-start">
                          <span className="text-[#FF7A45] font-bold">✓</span>
                          <span>Fundamental skill building and conceptual learning</span>
                        </li>
                        <li className="flex gap-2.5 items-start">
                          <span className="text-[#FF7A45] font-bold">✓</span>
                          <span>Direct practice guidelines with certified educators</span>
                        </li>
                        <li className="flex gap-2.5 items-start">
                          <span className="text-[#FF7A45] font-bold">✓</span>
                          <span>Comprehensive portfolios and interactive projects</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-[#1F2937] mb-3">Pre-requisites</h4>
                      <ul className="space-y-2.5 text-sm text-[#6B7280]">
                        <li className="flex gap-2.5 items-start">
                          <span className="text-[#FF7A45] font-bold">✓</span>
                          <span>No prior experience needed - beginner friendly</span>
                        </li>
                        <li className="flex gap-2.5 items-start">
                          <span className="text-[#FF7A45] font-bold">✓</span>
                          <span>Basic study materials and notebook for notes</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {user && isRegistered && (
              <TabsContent value="my-progress">
                <Card className="rounded-[24px] border-gray-100 bg-white p-2 shadow-sm">
                  <CardContent className="p-10 text-center">
                    <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <p className="text-[#6B7280] font-medium mb-4">
                      Track your progress for {hobby.name}
                    </p>
                    <Button 
                      className="bg-[#FF7A45] hover:bg-[#ff8f61] text-white font-semibold rounded-xl h-11 px-6"
                      onClick={() => router.push('/dashboard')}
                    >
                      Go to Dashboard
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        ) : (
          <Card className="rounded-[24px] border-gray-100 shadow-sm bg-gradient-to-br from-white to-gray-50">
            <CardContent className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-[#FFF2EB] flex items-center justify-center mx-auto mb-4">
                <Heart className="w-10 h-10 text-[#FF7A45]" />
              </div>
              <h3 className="text-2xl font-bold text-[#1F2937] mb-2">Register to Access Lessons</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Click the "Register for this Hobby" button above to start learning and book lessons!
              </p>
              <Button 
                onClick={handleRegisterForHobby}
                disabled={registerForHobbyMutation.isPending}
                className="bg-[#FF7A45] hover:bg-[#ff8f61] text-white font-bold rounded-xl h-12 px-8 shadow-md"
              >
                <Heart className="w-4 h-4 mr-2" />
                {registerForHobbyMutation.isPending ? 'Registering...' : 'Register Now'}
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      {}
      <AlertDialog open={showUnregisterDialog} onOpenChange={setShowUnregisterDialog}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-[#1F2937]">
              Are you sure you want to unregister?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#6B7280]">
              This action cannot be undone. You will lose access to all lessons and progress for 
              <span className="font-semibold text-[#FF7A45]"> {hobby?.name}</span>.
              {lessons?.length > 0 && (
                <div className="mt-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    ⚠️ You are currently registered for {lessons.length} upcoming lesson(s). 
                    Unregistering will cancel all your lesson registrations.
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-gray-200 hover:bg-gray-50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmUnregister}
              className="bg-red-500 hover:bg-red-600 text-white rounded-xl"
            >
              Yes, Unregister
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
