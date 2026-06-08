"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import api from "@/lib/api";
import VideoCall from "@/components/VideoCall";
import { Calendar, Clock, User, Video, X } from "lucide-react";

export default function MyLessonsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [activeVideoRoom, setActiveVideoRoom] = useState<{
    url: string;
    lessonTitle: string;
  } | null>(null);

  const { data: registrations, isLoading } = useQuery({
    queryKey: ["my-lessons"],
    queryFn: async () => {
      const response = await api.get("/my-lessons");
      return response.data;
    },
    enabled: !!user,
  });

  const unregisterMutation = useMutation({
    mutationFn: async (lessonId: number) => {
      await api.delete(`/lessons/${lessonId}/unregister`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-lessons"] });
      alert("Unregistered from class successfully.");
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || "Failed to cancel registration");
    },
  });

  const joinVideoCall = async (lessonId: number) => {
    try {
      const response = await api.get(`/video/sessions/${lessonId}/join`);
      setActiveVideoRoom({
        url: response.data.roomUrl,
        lessonTitle: response.data.roomName,
      });
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to join video call");
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center font-semibold text-gray-500">
          Loading your schedule...
        </div>
      </div>
    );
  }

  if (!user) {
    router.push("/login");
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

  const allRegistrations = [
    ...(registrations?.upcoming || []),
    ...(registrations?.past || []),
  ];

  const activeLessons = allRegistrations.filter((reg: any) => {
    const lessonStart = new Date(reg.lesson.dateTime);
    const lessonEnd = new Date(
      lessonStart.getTime() + reg.lesson.durationMinutes * 60000,
    );
    return now >= lessonStart && now <= lessonEnd;
  });

  const upcomingLessons =
    registrations?.upcoming?.filter((reg: any) => {
      const lessonStart = new Date(reg.lesson.dateTime);
      return now < lessonStart;
    }) || [];

  const pastLessons =
    registrations?.past?.filter((reg: any) => {
      const lessonStart = new Date(reg.lesson.dateTime);
      const lessonEnd = new Date(
        lessonStart.getTime() + reg.lesson.durationMinutes * 60000,
      );
      return now > lessonEnd;
    }) || [];

  const LessonCard = ({
    registration,
    isActive = false,
  }: {
    registration: any;
    isActive?: boolean;
  }) => {
    const lesson = registration.lesson;
    const lessonStart = new Date(lesson.dateTime);
    const lessonEnd = new Date(
      lessonStart.getTime() + lesson.durationMinutes * 60000,
    );
    const canJoin = isActive && lesson.zoomLink;

    return (
      <Card className="border border-gray-100 bg-white rounded-[24px] hover:shadow-lg transition-all duration-300 overflow-hidden shadow-sm">
        <CardContent className="p-6 ">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-[#1F2937] tracking-tight">
                  {lesson.title}
                </h3>
                {isActive && (
                  <span className="text-[10px] font-bold bg-green-50 text-green-600 border border-green-150 px-2.5 py-1 rounded-full uppercase tracking-wider animate-pulse">
                    Live Now
                  </span>
                )}
              </div>
              <p className="text-[#6B7280] text-sm leading-relaxed">
                {lesson.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-3 text-xs md:text-sm font-semibold text-[#6B7280]">
                <div className="flex items-center gap-2">
                  <User className="h-4.5 w-4.5 text-[#FF7A45]" />
                  <span>
                    Teacher: {lesson.teacher?.profile?.firstName}{" "}
                    {lesson.teacher?.profile?.lastName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4.5 w-4.5 text-[#FF7A45]" />
                  <span>{lessonStart.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4.5 w-4.5 text-[#FF7A45]" />
                  <span>
                    {lessonStart.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -{" "}
                    {lessonEnd.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#FF7A45] bg-[#FFF2EB] px-2.5 py-0.5 rounded-md text-xs">
                    {lesson.hobby?.name}
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full md:w-auto shrink-0 flex flex-col gap-2">
              {canJoin && (
                <Button
                  className="w-full md:w-auto h-11 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl"
                  onClick={() => joinVideoCall(lesson.id)}
                >
                  <Video className="h-4 w-4 mr-2" />
                  Join Live
                </Button>
              )}
              {!isActive && lessonStart > now && (
                <Button
                  variant="outline"
                  className="w-full md:w-auto h-11 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold"
                  onClick={() => unregisterMutation.mutate(lesson.id)}
                >
                  <X className="h-4 w-4 mr-2 text-red-500" />
                  Cancel Class Spot
                </Button>
              )}
              {lessonStart < now && lesson.recordingUrl && (
                <a
                  href={lesson.recordingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full"
                >
                  <Button
                    variant="outline"
                    className="w-full h-11 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold"
                  >
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
          <div className="flex gap-4">
            <Link href="/dashboard">
              <Button
                variant="ghost"
                className="text-sm font-semibold text-[#6B7280] hover:text-[#FF7A45]"
              >
                Dashboard
              </Button>
            </Link>
            <Link href="/lessons">
              <Button
                variant="ghost"
                className="text-sm font-semibold text-[#6B7280] hover:text-[#FF7A45]"
              >
                Browse Lessons
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-14 py-12">
        <div className="mb-10">
          <span className="text-xs font-bold text-[#FF7A45] tracking-wider uppercase mb-2 block font-sans">
            Classroom Schedule
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#1F2937] mb-2">
            My Registered Lessons
          </h1>
          <p className="text-base text-[#6B7280]">
            Attend live meetings and manage scheduled sessions.
          </p>
        </div>

        {upcomingLessons.length === 0 &&
        activeLessons.length === 0 &&
        pastLessons.length === 0 ? (
          <Card className="rounded-[24px] border-gray-150 bg-white p-2 shadow-sm text-center py-16 max-w-xl mx-auto">
            <CardContent className="space-y-6">
              <Calendar className="h-14 w-14 mx-auto text-[#FF7A45] mb-2 opacity-80" />
              <h2 className="text-xl font-extrabold text-[#1F2937]">
                No lessons scheduled yet
              </h2>
              <p className="text-sm text-[#6B7280] leading-relaxed max-w-md mx-auto">
                You haven't registered for any classes. Start exploring learning
                tracks to book live sessions.
              </p>
              <Link href="/lessons">
                <Button className="bg-[#FF7A45] hover:bg-[#ff8f61] text-[#1F2937] font-bold h-11 px-8 rounded-xl transition-all">
                  Browse Live Lessons
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="upcoming" className="space-y-8">
            <TabsList className="bg-gray-100/70 p-1.5 rounded-xl border border-gray-100 max-w-md">
              <TabsTrigger
                value="active"
                className="rounded-lg py-2.5 font-semibold text-sm"
              >
                Live Now ({activeLessons.length})
              </TabsTrigger>
              <TabsTrigger
                value="upcoming"
                className="rounded-lg py-2.5 font-semibold text-sm"
              >
                Upcoming ({upcomingLessons.length})
              </TabsTrigger>
              <TabsTrigger
                value="past"
                className="rounded-lg py-2.5 font-semibold text-sm"
              >
                Past ({pastLessons.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-6">
              {activeLessons.length === 0 ? (
                <Card className="rounded-[24px] border-gray-100 shadow-sm text-center py-12">
                  <CardContent>
                    <p className="text-gray-500 font-medium">
                      No live lessons running at this exact time
                    </p>
                  </CardContent>
                </Card>
              ) : (
                activeLessons.map((registration: any) => (
                  <LessonCard
                    key={registration.id}
                    registration={registration}
                    isActive={true}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="upcoming" className="space-y-6">
              {upcomingLessons.length === 0 ? (
                <Card className="rounded-[24px] border-gray-100 shadow-sm text-center py-12">
                  <CardContent>
                    <p className="text-gray-500 font-medium mb-3">
                      No upcoming lessons registered
                    </p>
                    <Link href="/lessons">
                      <Button
                        variant="link"
                        className="text-[#FF7A45] font-semibold hover:underline"
                      >
                        Find live classes
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                upcomingLessons.map((registration: any) => (
                  <LessonCard
                    key={registration.id}
                    registration={registration}
                    isActive={false}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-6">
              {pastLessons.length === 0 ? (
                <Card className="rounded-[24px] border-gray-100 shadow-sm text-center py-12">
                  <CardContent>
                    <p className="text-gray-500 font-medium">
                      No history of past sessions found
                    </p>
                  </CardContent>
                </Card>
              ) : (
                pastLessons.map((registration: any) => (
                  <LessonCard
                    key={registration.id}
                    registration={registration}
                    isActive={false}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
