'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth-provider';
import api from '../lib/api';
import VideoCall from '@/components/VideoCall';
import { Calendar, Clock, User, Video, X, CheckCircle, Clock3 } from 'lucide-react';

export default function MyLessonsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [activeVideoRoom, setActiveVideoRoom] = useState<{ url: string; lessonTitle: string } | null>(null);

  const { data: registrations, isLoading } = useQuery({
    queryKey: ['my-lessons'],
    queryFn: async () => {
      const response = await api.get('/my-lessons');
      return response.data;
    },
    enabled: !!user,
  });

  const unregisterMutation = useMutation({
    mutationFn: async (lessonId: number) => {
      await api.delete(`/lessons/${lessonId}/unregister`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-lessons'] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Failed to cancel registration');
    },
  });

  const joinVideoCall = async (lessonId: number) => {
    try {
      const response = await api.get(`/video/sessions/${lessonId}/join`);
      setActiveVideoRoom({
        url: response.data.roomUrl,
        lessonTitle: response.data.roomName
      });
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to join video call');
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  if (activeVideoRoom) {
    return (
      <VideoCall
        roomUrl={activeVideoRoom.url}
        userName={`${user.profile?.firstName} ${user.profile?.lastName}`}
        onLeave={() => setActiveVideoRoom(null)}
      />
    );
  }

  const now = new Date();

  const allRegistrations = [...(registrations?.upcoming || []), ...(registrations?.past || [])];

  const activeLessons = allRegistrations.filter((reg: any) => {
    const lessonStart = new Date(reg.lesson.dateTime);
    const lessonEnd = new Date(lessonStart.getTime() + reg.lesson.durationMinutes * 60000);
    return now >= lessonStart && now <= lessonEnd;
  });

  const upcomingLessons = registrations?.upcoming?.filter((reg: any) => {
    const lessonStart = new Date(reg.lesson.dateTime);
    return now < lessonStart;
  }) || [];

  const pastLessons = registrations?.past?.filter((reg: any) => {
    const lessonStart = new Date(reg.lesson.dateTime);
    const lessonEnd = new Date(lessonStart.getTime() + reg.lesson.durationMinutes * 60000);
    return now > lessonEnd;
  }) || [];

  const LessonCard = ({ registration, isActive = false }: { registration: any; isActive?: boolean }) => {
    const lesson = registration.lesson;
    const lessonStart = new Date(lesson.dateTime);
    const lessonEnd = new Date(lessonStart.getTime() + lesson.durationMinutes * 60000);
    const canJoin = isActive && lesson.zoomLink;

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold">{lesson.title}</h3>
                {isActive && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    Live Now
                  </span>
                )}
              </div>
              <p className="text-gray-600 text-sm mb-3">{lesson.description}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Teacher: {lesson.teacher?.profile?.firstName} {lesson.teacher?.profile?.lastName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{lessonStart.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{lessonStart.toLocaleTimeString()} - {lessonEnd.toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-600 font-medium">{lesson.hobby?.name}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {canJoin && (
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => joinVideoCall(lesson.id)}
                >
                  <Video className="h-4 w-4 mr-2" />
                  Join Live
                </Button>
              )}
              {!isActive && lessonStart > now && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => unregisterMutation.mutate(lesson.id)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel Registration
                </Button>
              )}
              {lessonStart < now && lesson.recordingUrl && (
                <a href={lesson.recordingUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full">
                    Watch Recording
                  </Button>
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-purple-600">HobbyHub</Link>
          <div className="flex gap-4">
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Link href="/lessons">
              <Button variant="ghost">Browse Lessons</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">My Lessons</h1>
        <p className="text-gray-600 mb-8">View and manage your registered lessons</p>

        {upcomingLessons.length === 0 && activeLessons.length === 0 && pastLessons.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold mb-2">No lessons yet</h2>
              <p className="text-gray-500 mb-6">You haven't registered for any lessons</p>
              <Link href="/lessons">
                <Button>Browse Lessons</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="upcoming" className="space-y-6">
            <TabsList>
              <TabsTrigger value="active">
                Live Now ({activeLessons.length})
              </TabsTrigger>
              <TabsTrigger value="upcoming">
                Upcoming ({upcomingLessons.length})
              </TabsTrigger>
              <TabsTrigger value="past">
                Past ({pastLessons.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              {activeLessons.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500">No live lessons at the moment</p>
                  </CardContent>
                </Card>
              ) : (
                activeLessons.map((registration: any) => (
                  <LessonCard key={registration.id} registration={registration} isActive={true} />
                ))
              )}
            </TabsContent>

            <TabsContent value="upcoming" className="space-y-4">
              {upcomingLessons.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500">No upcoming lessons</p>
                    <Link href="/lessons">
                      <Button variant="link">Browse lessons</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                upcomingLessons.map((registration: any) => (
                  <LessonCard key={registration.id} registration={registration} isActive={false} />
                ))
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-4">
              {pastLessons.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500">No past lessons</p>
                  </CardContent>
                </Card>
              ) : (
                pastLessons.map((registration: any) => (
                  <LessonCard key={registration.id} registration={registration} isActive={false} />
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}