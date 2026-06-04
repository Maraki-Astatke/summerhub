'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth-provider';
import api from '../lib/api';
import { Calendar, User, Clock, Users, MapPin } from 'lucide-react';

export default function LessonsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [hobbyId, setHobbyId] = useState('');

  const { data: lessonsData, isLoading, refetch } = useQuery({
    queryKey: ['lessons', search, hobbyId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (hobbyId) params.append('hobbyId', hobbyId);
      params.append('upcoming', 'true');
      params.append('limit', '20');
      
      const response = await api.get(`/lessons?${params.toString()}`);
      return response.data;
    },
  });

  const { data: hobbies } = useQuery({
    queryKey: ['hobbies-list'],
    queryFn: async () => {
      const response = await api.get('/hobbies?limit=100');
      return response.data.data;
    },
  });

  const registerForLesson = async (lessonId: number) => {
    if (!user) {
      alert('Please login to register for lessons');
      return;
    }
    try {
      await api.post(`/lessons/${lessonId}/register`);
      refetch();
      alert('Successfully registered!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-purple-600">HobbyHub</Link>
          <div className="flex gap-4">
            <Link href="/hobbies">
              <Button variant="ghost">Hobbies</Button>
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
        <h1 className="text-3xl font-bold mb-2">Live Lessons</h1>
        <p className="text-gray-600 mb-8">Join interactive sessions with expert teachers</p>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <Input
              placeholder="Search lessons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            
            <select 
              className="border rounded-md px-3 py-2"
              value={hobbyId}
              onChange={(e) => setHobbyId(e.target.value)}
            >
              <option value="">All Hobbies</option>
              {hobbies?.map((hobby: any) => (
                <option key={hobby.id} value={hobby.id}>{hobby.name}</option>
              ))}
            </select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearch('');
                setHobbyId('');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="text-center py-12">Loading...</div>
        ) : lessonsData?.data?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No upcoming lessons found</p>
            <Button variant="link" onClick={() => {
              setSearch('');
              setHobbyId('');
            }}>Clear filters</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {lessonsData?.data?.map((lesson: any) => (
              <Card key={lesson.id}>
                <div className="flex flex-col md:flex-row justify-between p-6">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{lesson.title}</h3>
                    <p className="text-gray-600 mb-4">{lesson.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>Teacher: {lesson.teacher?.profile?.firstName} {lesson.teacher?.profile?.lastName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(lesson.dateTime).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{lesson.durationMinutes} minutes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{lesson.registrations?.length || 0} / {lesson.maxStudents} enrolled</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-purple-600 font-medium">{lesson.hobby?.name}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 md:mt-0 md:ml-6 flex items-center">
                    <Button 
                      onClick={() => registerForLesson(lesson.id)}
                      disabled={lesson.registrations?.length >= lesson.maxStudents}
                      className="w-full md:w-auto"
                    >
                      {lesson.registrations?.length >= lesson.maxStudents ? 'Class Full' : 'Register Now'}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {lessonsData?.pagination?.pages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <Button variant="outline" disabled>Previous</Button>
            <Button variant="outline">Next</Button>
          </div>
        )}
      </main>
    </div>
  );
}