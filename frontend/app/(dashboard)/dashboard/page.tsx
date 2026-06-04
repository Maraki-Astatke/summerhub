"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";
import { useQuery } from "@tanstack/react-query";
import api from "../../lib/api";
import {
  BookOpen,
  ShoppingBag,
  Award,
  Calendar,
  LogOut,
  Trophy,
} from "lucide-react";
import { MessageCircle } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  // Redirect teachers to teacher dashboard
  useEffect(() => {
    if (user?.roles?.includes('teacher')) {
      router.push('/teacher');
    }
  }, [user, router]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      const response = await api.get("/dashboard/stats");
      return response.data;
    },
  });

  const { data: progress } = useQuery({
    queryKey: ["dashboardProgress"],
    queryFn: async () => {
      const response = await api.get("/dashboard/progress");
      return response.data;
    },
  });

  const { data: certificates } = useQuery({
    queryKey: ["certificates"],
    queryFn: async () => {
      const response = await api.get("/dashboard/certificates");
      return response.data;
    },
  });

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-purple-600">My Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Welcome, {user.profile?.firstName || user.email}{" "}
              {user.profile?.lastName || ""}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Hobbies Discovered
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.hobbiesDiscovered || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Lessons Taken
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.registeredLessons || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Blog Posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.blogPostsWritten || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.ordersPlaced || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="progress" className="space-y-6">
          <TabsList>
            <TabsTrigger value="progress">My Progress</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="progress">
            <Card>
              <CardHeader>
                <CardTitle>Learning Progress</CardTitle>
                <CardDescription>Track your learning journey</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {progress?.allHobbies?.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center"
                  >
                    <div>
                      <span className="font-medium">{item.hobby.name}</span>
                      <p className="text-sm text-gray-500">
                        {item.hobby.category?.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-600 rounded-full"
                          style={{
                            width: `${(item.interestLevel / 5) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">
                        {item.interestLevel}/5
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certificates">
            <Card>
              <CardHeader>
                <CardTitle>Your Certificates</CardTitle>
                <CardDescription>Lessons you've completed</CardDescription>
              </CardHeader>
              <CardContent>
                {certificates?.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No certificates yet. Complete lessons to earn certificates!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {certificates?.map((cert: any) => (
                      <div
                        key={cert.id}
                        className="flex justify-between items-center p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{cert.title}</p>
                          <p className="text-sm text-gray-500">
                            {cert.hobby} • {cert.teacher}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
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
            <Card>
              <CardHeader>
                <CardTitle>Recommended for You</CardTitle>
                <CardDescription>Based on your quiz results</CardDescription>
              </CardHeader>
              <CardContent>
                {!progress?.quizCompleted ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">
                      Take the interest quiz to get personalized recommendations
                    </p>
                    <Button>Take Quiz</Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {progress?.topHobbies?.map((item: any) => (
                      <div key={item.id} className="p-3 border rounded-lg">
                        <p className="font-medium">{item.hobby.name}</p>
                        <p className="text-sm text-gray-500">
                          {item.hobby.category?.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <Button
            variant="outline"
            className="h-20 flex flex-col gap-1"
            onClick={() => router.push("/hobbies")}
          >
            <BookOpen className="h-5 w-5" />
            <span>Browse Hobbies</span>
          </Button>
          <Button
            variant="outline"
            className="h-20 flex flex-col gap-1"
            onClick={() => router.push("/my-lessons")}
          >
            <Calendar className="h-5 w-5" />
            <span>My Lessons</span>
          </Button>
          <Button
            variant="outline"
            className="h-20 flex flex-col gap-1"
            onClick={() => router.push("/shops")}
          >
            <ShoppingBag className="h-5 w-5" />
            <span>Visit Shop</span>
          </Button>
          <Button
            variant="outline"
            className="h-20 flex flex-col gap-1"
            onClick={() => router.push("/events")}
          >
            <Trophy className="h-5 w-5" />
            <span>Talent Events</span>
          </Button>
          <Button
            variant="outline"
            className="h-20 flex flex-col gap-1"
            onClick={() => router.push("/chat")}
          >
            <MessageCircle className="h-5 w-5" />
            <span>Messages</span>
          </Button>
        </div>
      </main>
    </div>
  );
}