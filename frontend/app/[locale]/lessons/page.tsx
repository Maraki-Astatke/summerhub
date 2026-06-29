'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth-provider';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { Calendar, User, Clock, Users, Video, CheckCircle2 } from 'lucide-react';

export default function LessonsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [hobbyId, setHobbyId] = useState('');
  const [joiningLesson, setJoiningLesson] = useState<number | null>(null);

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

  // Check if the current logged-in student has registered for this lesson
  const isRegisteredForLesson = (lesson: any): boolean => {
    if (!user) return false;
    return lesson.registrations?.some(
      (r: any) => r.studentId === user.id || r.student?.id === user.id
    );
  };

  // Check if the lesson is currently live (started and not yet ended)
  const isLessonLive = (lesson: any): boolean => {
    const now = new Date();
    const start = new Date(lesson.dateTime);
    const end = new Date(start.getTime() + lesson.durationMinutes * 60000);
    return now >= start && now <= end;
  };

  // Check if the lesson has already ended
  const isLessonPassed = (lesson: any): boolean => {
    const now = new Date();
    const start = new Date(lesson.dateTime);
    const end = new Date(start.getTime() + lesson.durationMinutes * 60000);
    return now > end;
  };

  const registerForLesson = async (lessonId: number) => {
    if (!user) {
      alert('Please login to register for lessons');
      return;
    }
    try {
      await api.post(`/lessons/${lessonId}/register`);
      refetch();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Registration failed');
    }
  };

  const joinLesson = async (lessonId: number) => {
    setJoiningLesson(lessonId);
    try {
      const response = await api.get(`/video/sessions/${lessonId}/join`);
      window.open(response.data.roomUrl, '_blank', 'noopener,noreferrer');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Video room not available yet. Try again shortly.');
    } finally {
      setJoiningLesson(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1F2937]">
      <Navbar alwaysWhite={true} />

      <main className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-14 py-12 pt-32">
        <div className="mb-10">
          <span className="text-xs font-bold text-[#FF7A45] tracking-wider uppercase mb-2 block font-sans">Live Classes</span>
          <h1 className="text-3xl md:text-4xl lg:text-[48px] font-extrabold tracking-tight text-[#1F2937] mb-3">
            Interactive Live Lessons
          </h1>
          <p className="text-base text-[#6B7280]">Join real-time classrooms with professional HobbyHub certified educators.</p>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              placeholder="Search classes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 px-4 rounded-xl border-gray-200 focus-visible:ring-[#FF7A45]"
            />

            <select
              className="h-11 border border-gray-200 rounded-xl px-4 py-2 text-sm text-[#1F2937] bg-white focus:outline-none focus:ring-2 focus:ring-[#FF7A45] focus:border-transparent transition-all"
              value={hobbyId}
              onChange={(e) => setHobbyId(e.target.value)}
            >
              <option value="">All Learning Tracks</option>
              {hobbies?.map((hobby: any) => (
                <option key={hobby.id} value={hobby.id}>{hobby.name}</option>
              ))}
            </select>

            <Button
              variant="outline"
              className="h-11 rounded-xl border-gray-200 hover:bg-gray-50 text-sm font-semibold text-gray-700"
              onClick={() => {
                setSearch('');
                setHobbyId('');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Lesson cards */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="bg-white rounded-[24px] border border-gray-100 p-8 space-y-4 animate-pulse">
                <div className="h-6 bg-gray-200 rounded-md w-1/3" />
                <div className="h-4 bg-gray-100 rounded w-full" />
                <div className="h-4 bg-gray-100 rounded w-5/6" />
              </div>
            ))}
          </div>
        ) : lessonsData?.data?.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-[24px] border border-gray-100 shadow-sm">
            <p className="text-gray-500 font-medium mb-3">No live lessons found</p>
            <Button
              variant="link"
              className="text-[#FF7A45] font-semibold hover:underline"
              onClick={() => {
                setSearch('');
                setHobbyId('');
              }}
            >
              Clear all filters
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {lessonsData?.data?.map((lesson: any) => {
              const registered = isRegisteredForLesson(lesson);
              const live = isLessonLive(lesson);
              const full = lesson.registrations?.length >= lesson.maxStudents;

              return (
                <Card key={lesson.id} className="border border-gray-100 bg-white rounded-[24px] hover:shadow-lg transition-all duration-300 overflow-hidden shadow-sm">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 md:p-8 gap-6">
                    {/* Lesson info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="text-[11px] font-bold text-[#FF7A45] bg-[#FFF2EB] px-3 py-1 rounded-full uppercase tracking-wider">
                          {lesson.hobby?.name}
                        </span>
                        {live && (
                          <span className="text-[11px] font-bold text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full uppercase tracking-wider animate-pulse">
                            🔴 Live Now
                          </span>
                        )}
                      </div>

                      <h3 className="text-2xl font-bold text-[#1F2937] tracking-tight">{lesson.title}</h3>
                      <p className="text-sm text-[#6B7280] leading-relaxed max-w-3xl">{lesson.description}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-3 text-xs md:text-sm font-semibold text-[#6B7280]">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-[#FF7A45]" />
                          <span>Teacher: {lesson.teacher?.profile?.firstName} {lesson.teacher?.profile?.lastName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-[#FF7A45]" />
                          <span>{new Date(lesson.dateTime).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-[#FF7A45]" />
                          <span>
                            {new Date(lesson.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {' '}· {lesson.durationMinutes} min
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-[#FF7A45]" />
                          <span>{lesson.registrations?.length || 0} / {lesson.maxStudents} enrolled</span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="w-full md:w-48 shrink-0 flex flex-col gap-2">
                      {registered ? (
                        <>
                          {/* Always show "You're registered" badge */}
                          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
                            <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                            <span className="text-sm font-semibold text-green-700 leading-tight">
                              You&apos;re registered for this spot
                            </span>
                          </div>

                          {/* Show Join Now ONLY when the lesson is live */}
                          {live && (
                            <Button
                              onClick={() => joinLesson(lesson.id)}
                              disabled={joiningLesson === lesson.id}
                              className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl gap-2 shadow-md shadow-green-200"
                            >
                              <Video className="h-4 w-4" />
                              {joiningLesson === lesson.id ? 'Joining...' : 'Join Now'}
                            </Button>
                          )}
                        </>
                      ) : isLessonPassed(lesson) ? (
                        <Button
                          disabled
                          className="w-full h-11 bg-gray-200 text-gray-500 font-semibold rounded-xl cursor-not-allowed opacity-100"
                        >
                          Lesson Passed
                        </Button>
                      ) : full ? (
                        <Button
                          disabled
                          className="w-full h-11 bg-gray-100 text-gray-400 font-semibold rounded-xl cursor-not-allowed opacity-100"
                        >
                          Class Full
                        </Button>
                      ) : (
                        <Button
                          onClick={() => registerForLesson(lesson.id)}
                          className="w-full h-11 bg-[#FF7A45] hover:bg-[#ff8f61] text-white font-semibold rounded-xl"
                        >
                          Register Class Spot
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {lessonsData?.pagination?.pages > 1 && (
          <div className="flex justify-center gap-3 mt-12">
            <Button variant="outline" className="rounded-xl" disabled>Previous</Button>
            <Button variant="outline" className="rounded-xl">Next</Button>
          </div>
        )}
      </main>
    </div>
  );
}
