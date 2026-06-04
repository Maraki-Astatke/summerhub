'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth-provider';
import api from '../../lib/api';
import { Calendar, User, Clock, Users } from 'lucide-react';

export default function HobbyDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const { data: hobby, isLoading } = useQuery({
    queryKey: ['hobby', id],
    queryFn: async () => {
      const response = await api.get(`/hobbies/${id}`);
      return response.data;
    },
  });

  const { data: lessons, refetch: refetchLessons } = useQuery({
    queryKey: ['lessons', id],
    queryFn: async () => {
      const response = await api.get(`/lessons?hobbyId=${id}&upcoming=true`);
      return response.data.data;
    },
  });

  const registerForLesson = async (lessonId: number) => {
    if (!user) {
      router.push('/login');
      return;
    }
    try {
      await api.post(`/lessons/${lessonId}/register`);
      refetchLessons();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Registration failed');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!hobby) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Hobby not found</p>
          <Link href="/hobbies">
            <Button className="mt-4">Back to Hobbies</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-purple-600">HobbyHub</Link>
          <div className="flex gap-4">
            <Link href="/hobbies">
              <Button variant="ghost">Browse Hobbies</Button>
            </Link>
            {user ? (
              <Link href="/dashboard">
                <Button>Dashboard</Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button>Login</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hobby Info */}
        <div className="bg-white rounded-lg p-6 mb-8">
          <h1 className="text-3xl font-bold mb-2">{hobby.name}</h1>
          <p className="text-gray-600 mb-4">{hobby.description}</p>
          <div className="flex flex-wrap gap-4">
            {hobby.ageGroup && (
              <span className="text-sm bg-gray-100 px-3 py-1 rounded">
                Ages: {hobby.ageGroup}
              </span>
            )}
            {hobby.category && (
              <span className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded">
                {hobby.category.name}
              </span>
            )}
          </div>
        </div>

        <Tabs defaultValue="lessons" className="space-y-6">
          <TabsList>
            <TabsTrigger value="lessons">Upcoming Lessons</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            {user && <TabsTrigger value="my-progress">My Progress</TabsTrigger>}
          </TabsList>

          <TabsContent value="lessons">
            {lessons?.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-gray-500">No upcoming lessons for this hobby yet.</p>
                  <p className="text-sm text-gray-400 mt-2">Check back later!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {lessons?.map((lesson: any) => (
                  <Card key={lesson.id}>
                    <CardHeader>
                      <CardTitle>{lesson.title}</CardTitle>
                      <CardDescription>{lesson.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="h-4 w-4" />
                        <span>Teacher: {lesson.teacher?.profile?.firstName} {lesson.teacher?.profile?.lastName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(lesson.dateTime).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{lesson.durationMinutes} minutes</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="h-4 w-4" />
                        <span>{lesson.registrations?.length || 0} / {lesson.maxStudents} students</span>
                      </div>
                      <Button 
                        className="w-full mt-4"
                        onClick={() => registerForLesson(lesson.id)}
                        disabled={lesson.registrations?.length >= lesson.maxStudents}
                      >
                        {lesson.registrations?.length >= lesson.maxStudents ? 'Class Full' : 'Register Now'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>About {hobby.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>{hobby.description}</p>
                <div>
                  <h3 className="font-semibold mb-2">What you'll learn:</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>Fundamental skills and techniques</li>
                    <li>Hands-on practice with expert guidance</li>
                    <li>Project-based learning</li>
                    <li>Community of fellow learners</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Requirements:</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>No prior experience needed</li>
                    <li>Basic materials (provided in course)</li>
                    <li>Willingness to learn and practice</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {user && (
            <TabsContent value="my-progress">
              <Card>
                <CardHeader>
                  <CardTitle>Your Progress</CardTitle>
                  <CardDescription>Track your learning journey in {hobby.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-gray-500">Start taking lessons to see your progress here!</p>
                    <Button className="mt-4" onClick={() => document.querySelector('[value="lessons"]')?.dispatchEvent(new Event('click'))}>
                      Browse Lessons
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
}