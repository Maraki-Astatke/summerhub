'use client'
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/providers/auth-provider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  BookOpen,
  ShoppingBag,
  Award,
  Calendar,
  LogOut,
  Trophy,
  MessageCircle,
  Menu,
  X,
  LayoutDashboard,
  User,
  GraduationCap,
  Home,
  Settings,
  HelpCircle,
  BarChart3,
  Music,
  Palette,
  Code2,
  Camera,
  PenTool,
  Gamepad2,
  Sparkles,
  Video,
  Heart,
  MessageSquare,
  Download,
  FileText,
  Upload,
  Send,
  Package,
  Briefcase,
  MapPin,
  DollarSign,
  Building,
  Clock,
  Users,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, logout } = useAuth();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submissionForm, setSubmissionForm] = useState({
    title: "",
    description: "",
    teacherId: "",
    lessonId: "",
    file: null as File | null,
  });

  // Job Application Modal
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyingJob, setApplyingJob] = useState<any>(null);
  const [applyForm, setApplyForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    description: "",
    cv: null as File | null,
  });

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (user?.roles?.includes("scholarship_giver")) {
      router.push("/scholarship-giver");
      return;
    }

    if (user?.roles?.includes("admin")) {
      router.push("/admin");
      return;
    }
    if (user?.roles?.includes("teacher")) {
      router.push("/teacher");
      return;
    }
    if (user?.roles?.includes("seller")) {
      router.push("/seller");
      return;
    }
    if (user?.roles?.includes("parent")) {
      router.push("/parent");
      return;
    }
  }, [user, authLoading, router]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const { data: stats } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      const response = await api.get("/dashboard/stats");
      return response.data;
    },
    enabled: !!user,
  });

  const { data: progress } = useQuery({
    queryKey: ["dashboardProgress"],
    queryFn: async () => {
      const response = await api.get("/dashboard/progress");
      return response.data;
    },
    enabled: !!user,
  });

  const { data: certificates } = useQuery({
    queryKey: ["certificates"],
    queryFn: async () => {
      const response = await api.get("/dashboard/certificates");
      return response.data;
    },
    enabled: !!user,
  });

  const { data: recommendations } = useQuery({
    queryKey: ["quiz-recommendations"],
    queryFn: async () => {
      try {
        const response = await api.get("/quiz/recommendations");
        return response.data || [];
      } catch (error) {
        console.log("Failed to fetch recommendations:", error);
        return [];
      }
    },
    enabled: !!user && user?.roles?.[0] === "student",
    retry: false,
  });

  const { data: studentResources, isLoading: resourcesLoading } = useQuery({
    queryKey: ["student-resources"],
    queryFn: async () => {
      const response = await api.get("/resources/student");
      return response.data;
    },
    enabled: !!user && user?.roles?.[0] === "student",
  });

  const { data: orders } = useQuery({
    queryKey: ["dashboard-orders"],
    queryFn: async () => {
      const response = await api.get("/orders");
      return response.data;
    },
    enabled: !!user && user?.roles?.[0] === "student",
  });

  const { data: teachers } = useQuery({
    queryKey: ["teachers-list"],
    queryFn: async () => {
      const response = await api.get("/users/teachers");
      return response.data;
    },
    enabled: !!user && user?.roles?.[0] === "student",
  });

  const { data: teacherLessons } = useQuery({
    queryKey: ["teacher-lessons-submit", submissionForm.teacherId],
    queryFn: async () => {
      if (!submissionForm.teacherId) return [];
      const response = await api.get("/resources/teacher/lessons");
      return response.data;
    },
    enabled: !!submissionForm.teacherId && user?.roles?.[0] === "student",
  });

  const { data: jobOpportunities, isLoading: jobsLoading } = useQuery({
    queryKey: ["student-job-opportunities"],
    queryFn: async () => {
      const response = await api.get("/scholarship-giver/jobs/available");
      return response.data || [];
    },
    enabled: !!user && user?.roles?.[0] === "student",
  });

  const applyForJobMutation = useMutation({
    mutationFn: async ({ jobId, formData }: { jobId: number; formData: FormData }) => {
      const response = await api.post(`/scholarship-giver/jobs/${jobId}/apply`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-job-opportunities"] });
      toast.success("Application submitted successfully!");
      setShowApplyModal(false);
      setApplyingJob(null);
      setApplyForm({ fullName: "", email: "", phone: "", description: "", cv: null });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to apply for job");
    },
  });

  const { data: popularHobbies } = useQuery({
    queryKey: ["popularHobbies"],
    queryFn: async () => {
      try {
        const response = await api.get("/hobbies?limit=6&sort=popular");
        return response.data?.data || [];
      } catch {
        return [
          { id: 1, name: "Music Production", category: { name: "Music" }, icon: "music", studentCount: 234 },
          { id: 2, name: "Digital Art", category: { name: "Art" }, icon: "palette", studentCount: 189 },
          { id: 3, name: "Web Development", category: { name: "Coding" }, icon: "code2", studentCount: 456 },
          { id: 4, name: "Photography", category: { name: "Photography" }, icon: "camera", studentCount: 167 },
          { id: 5, name: "Creative Writing", category: { name: "Writing" }, icon: "penTool", studentCount: 123 },
          { id: 6, name: "Game Design", category: { name: "Gaming" }, icon: "gamepad2", studentCount: 98 },
        ];
      }
    },
    enabled: !!user,
  });

  const submitAssignmentMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.post("/resources/submit", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-resources"] });
      setShowSubmitModal(false);
      setSubmissionForm({ title: "", description: "", teacherId: "", lessonId: "", file: null });
      toast.success("Assignment submitted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to submit assignment");
    },
  });

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "music": return <Music className="w-5 h-5" />;
      case "palette": return <Palette className="w-5 h-5" />;
      case "code2": return <Code2 className="w-5 h-5" />;
      case "camera": return <Camera className="w-5 h-5" />;
      case "penTool": return <PenTool className="w-5 h-5" />;
      case "gamepad2": return <Gamepad2 className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'paid': return 'bg-green-100 text-green-700';
      case 'shipped': return 'bg-blue-100 text-blue-700';
      case 'delivered': return 'bg-[#FF7A45]/10 text-[#FF7A45]';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getOrderStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'paid': return 'Paid';
      case 'shipped': return 'Shipped';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const handleDownloadCertificate = (certId: number) => {
    const token = localStorage.getItem('token');
    window.open(`http://localhost:5001/api/certificates/${certId}/download?token=${token}`, '_blank');
  };

  const handleDownloadResource = (id: number) => {
    const token = localStorage.getItem('token');
    window.open(`http://localhost:5001/api/resources/${id}/download?token=${token}`, '_blank');
  };

  const handleSubmitAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionForm.title) {
      toast.error("Please enter a title");
      return;
    }
    if (!submissionForm.teacherId) {
      toast.error("Please select a teacher");
      return;
    }

    const formData = new FormData();
    formData.append("title", submissionForm.title);
    if (submissionForm.description) formData.append("description", submissionForm.description);
    formData.append("teacherId", submissionForm.teacherId);
    if (submissionForm.lessonId) formData.append("lessonId", submissionForm.lessonId);
    if (submissionForm.file) formData.append("file", submissionForm.file);

    submitAssignmentMutation.mutate(formData);
  };

  const isRedirecting = user && (
    user.roles?.includes("admin") ||
    user.roles?.includes("teacher") ||
    user.roles?.includes("seller") ||
    user.roles?.includes("parent") ||
    user.roles?.includes("scholarship_giver")
  );

  if (authLoading || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const menuItems = [
    { id: "dashboard", label: "Overview", icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: "progress", label: "My Progress", icon: <BarChart3 className="w-5 h-5" /> },
    { id: "certificates", label: "Certificates", icon: <Award className="w-5 h-5" /> },
    { id: "resources", label: "Resources", icon: <FileText className="w-5 h-5" /> },
    { id: "recommendations", label: "Recommendations", icon: <GraduationCap className="w-5 h-5" /> },
    { id: "orders", label: "Order History", icon: <Package className="w-5 h-5" /> },
    { id: "jobs", label: "Job Opportunities", icon: <Briefcase className="w-5 h-5" /> },
  ];

  const renderContent = () => {
    if (activeTab === "dashboard") {
      return (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border border-gray-100 dark:border-gray-700 dark:bg-gray-800 rounded-xl">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-xs font-medium text-gray-500 dark:text-gray-400">Hobbies Discovered</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold text-gray-800 dark:text-white">{stats?.hobbiesDiscovered || 0}</div>
              </CardContent>
            </Card>
            <Card className="border border-gray-100 dark:border-gray-700 dark:bg-gray-800 rounded-xl">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-xs font-medium text-gray-500 dark:text-gray-400">Lessons Taken</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold text-gray-800 dark:text-white">{stats?.registeredLessons || 0}</div>
              </CardContent>
            </Card>
            <Card className="border border-gray-100 dark:border-gray-700 dark:bg-gray-800 rounded-xl">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-xs font-medium text-gray-500 dark:text-gray-400">Blog Posts</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold text-gray-800 dark:text-white">{stats?.blogPostsWritten || 0}</div>
              </CardContent>
            </Card>
            <Card className="border border-gray-100 dark:border-gray-700 dark:bg-gray-800 rounded-xl">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-xs font-medium text-gray-500 dark:text-gray-400">Orders</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold text-gray-800 dark:text-white">{stats?.ordersPlaced || 0}</div>
              </CardContent>
            </Card>
          </div>

          <Card className="border border-gray-100 dark:border-gray-700 dark:bg-gray-800 rounded-xl overflow-hidden mt-8">
            <CardHeader className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold dark:text-white">🔥 Popular Hobbies</CardTitle>
                  <CardDescription className="dark:text-gray-400">Most loved activities by our community</CardDescription>
                </div>
                <Link href="/hobbies">
                  <Button variant="ghost" className="text-[#FF7A45] hover:text-[#ff8f61]">View All →</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {popularHobbies?.map((hobby: any) => (
                  <div
                    key={hobby.id}
                    onClick={() => router.push(`/hobbies/${hobby.id}`)}
                    className="flex items-center gap-4 p-4 border border-gray-100 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900/50 hover:shadow-md transition-all duration-300 cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#FFF2EB] dark:bg-[#FF7A45]/10 flex items-center justify-center text-[#FF7A45] group-hover:bg-[#FF7A45] group-hover:text-white transition-colors duration-300">
                      {getIcon(hobby.icon)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-100 group-hover:text-[#FF7A45] transition-colors">{hobby.name}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{hobby.category?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#FF7A45]">{hobby.studentCount || 0}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">learners</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="mt-8">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              <Button variant="outline" className="h-20 flex flex-col gap-2 rounded-xl" onClick={() => router.push("/hobbies")}>
                <BookOpen className="h-5 w-5 text-[#FF7A45]" />
                <span className="text-xs">Browse Hobbies</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2 rounded-xl" onClick={() => router.push("/my-lessons")}>
                <Calendar className="h-5 w-5 text-[#FF7A45]" />
                <span className="text-xs">My Lessons</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2 rounded-xl" onClick={() => router.push("/shops")}>
                <ShoppingBag className="h-5 w-5 text-[#FF7A45]" />
                <span className="text-xs">Visit Shop</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2 rounded-xl" onClick={() => router.push("/events")}>
                <Trophy className="h-5 w-5 text-[#FF7A45]" />
                <span className="text-xs">Events</span>
              </Button>
            </div>
          </div>
        </>
      );
    }

    if (activeTab === "progress") {
      return (
        <Card className="border border-gray-100 dark:border-gray-700 dark:bg-gray-800 rounded-xl overflow-hidden">
          <CardHeader className="p-6">
            <CardTitle className="text-xl font-bold dark:text-white">Learning Progress</CardTitle>
            <CardDescription className="dark:text-gray-400">Track your active courses and completion status</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            {progress?.allHobbies?.length === 0 ? (
              <div className="text-center py-8 space-y-4">
                <p className="text-gray-500 dark:text-gray-400">No active courses. Explore popular hobbies below to begin!</p>
                <Button className="bg-[#FF7A45] hover:bg-[#ff8f61] text-white" onClick={() => router.push("/hobbies")}>
                  Explore Hobbies
                </Button>
              </div>
            ) : (
              progress?.allHobbies?.map((item: any) => (
                <div key={item.id} className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <div>
                    <span className="font-semibold text-gray-800 dark:text-gray-100">{item.hobby.name}</span>
                    <p className="text-xs text-[#FF7A45] font-medium">{item.hobby.category?.name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-[#FF7A45] rounded-full" style={{ width: `${(item.interestLevel / 5) * 100}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{item.interestLevel}/5</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      );
    }

    if (activeTab === "certificates") {
      return (
        <Card className="border border-gray-100 dark:border-gray-700 dark:bg-gray-800 rounded-xl overflow-hidden">
          <CardHeader className="p-6">
            <CardTitle className="text-xl font-bold dark:text-white">Your Certificates</CardTitle>
            <CardDescription className="dark:text-gray-400">Certificates you've earned from your teachers</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            {certificates?.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No certificates earned yet. Complete courses to get certified!</p>
            ) : (
              <div className="space-y-3">
                {certificates?.map((cert: any) => (
                  <div key={cert.id} className="flex justify-between items-center p-4 border border-gray-100 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-100">{cert.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {cert.hobby} • {cert.teacher}
                      </p>
                      {cert.customMessage && (
                        <p className="text-xs text-[#FF7A45] dark:text-[#FF7A45] mt-1 italic">"{cert.customMessage}"</p>
                      )}
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Issued: {new Date(cert.issuedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg"
                      onClick={() => handleDownloadCertificate(cert.id)}
                    >
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    if (activeTab === "resources") {
      return (
        <div className="space-y-6">
          { }
          <div className="flex justify-end">
            <Button onClick={() => setShowSubmitModal(true)} className="bg-[#FF7A45] hover:bg-[#ff8f61]">
              <Upload className="h-4 w-4 mr-2" />
              Submit Assignment
            </Button>
          </div>

          { }
          <Card className="border border-gray-100 dark:border-gray-700 dark:bg-gray-800 rounded-xl overflow-hidden">
            <CardHeader className="p-6">
              <CardTitle className="text-xl font-bold dark:text-white">My Resources</CardTitle>
              <CardDescription className="dark:text-gray-400">Files shared by your teachers</CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              {resourcesLoading ? (
                <div className="text-center py-8 dark:text-gray-400">Loading...</div>
              ) : !studentResources || studentResources.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No resources shared yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Teachers will share learning materials here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {studentResources?.map((resource: any) => (
                    <div key={resource.id} className="flex justify-between items-center p-4 border border-gray-100 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-100">{resource.title}</p>
                        {resource.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{resource.description}</p>
                        )}
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          From: {resource.sender?.profile?.firstName} {resource.sender?.profile?.lastName}
                          {resource.lesson?.title && ` • Lesson: ${resource.lesson.title}`}
                          {` • ${new Date(resource.createdAt).toLocaleDateString()}`}
                        </p>
                      </div>
                      {resource.fileUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg"
                          onClick={() => handleDownloadResource(resource.id)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    if (activeTab === "recommendations") {
      const hasRecommendations = recommendations && recommendations.length > 0;

      return (
        <Card className="border border-gray-100 dark:border-gray-700 dark:bg-gray-800 rounded-xl overflow-hidden">
          <CardHeader className="p-6">
            <CardTitle className="text-xl font-bold dark:text-white">Recommended for You</CardTitle>
            <CardDescription className="dark:text-gray-400">Personalized recommendations from our experts</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            {!hasRecommendations ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto">
                  <MessageSquare className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">No recommendations yet. Our experts will review your quiz answers and suggest hobbies for you soon!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recommendations?.map((rec: any) => (
                  <div key={rec.id} className="p-5 border dark:border-gray-700 rounded-xl bg-gradient-to-br from-[#FFF2EB] to-white dark:from-[#FF7A45]/10 dark:to-gray-800 hover:shadow-md transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#FF7A45]/10 dark:bg-[#FF7A45]/10 flex items-center justify-center flex-shrink-0">
                        <GraduationCap className="h-6 w-6 text-[#FF7A45] dark:text-[#FF7A45]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">{rec.hobby?.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{rec.hobby?.category?.name}</p>
                        {rec.reason && (
                          <div className="mt-3 p-3 bg-[#FFF2EB] dark:bg-[#FF7A45]/10 rounded-lg border border-[#FFF2EB] dark:border-[#FF7A45]/30">
                            <p className="text-sm text-[#FF7A45] dark:text-[#ff8f61] italic">"{rec.reason}"</p>
                          </div>
                        )}
                        <div className="flex items-center gap-4 mt-3">
                          <Button
                            size="sm"
                            className="bg-[#FF7A45] hover:bg-[#ff8f61] text-white rounded-lg text-xs h-8"
                            onClick={() => router.push(`/hobbies/${rec.hobby?.id}`)}
                          >
                            Explore Hobby
                          </Button>
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
      );
    }

    if (activeTab === "orders") {
      return (
        <Card className="border border-gray-100 dark:border-gray-700 dark:bg-gray-800 rounded-xl overflow-hidden">
          <CardHeader className="p-6">
            <CardTitle className="text-xl font-bold dark:text-white">Order History</CardTitle>
            <CardDescription className="dark:text-gray-400">Track your purchases and delivery status</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            {!orders || orders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No orders yet</p>
                <Link href="/shops">
                  <Button className="mt-4 bg-[#FF7A45] hover:bg-[#ff8f61]">Start Shopping</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders?.map((order: any) => (
                  <div key={order.id} className="border border-gray-100 dark:border-gray-700 rounded-xl p-5 hover:shadow-md transition-all duration-300">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <p className="font-bold text-gray-800 dark:text-gray-100">Order #{order.id}</p>
                          <span className={`text-xs px-3 py-1 rounded-full ${getOrderStatusBadge(order.status)}`}>
                            {getOrderStatusText(order.status)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(order.createdAt).toLocaleDateString()} • {new Date(order.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-[#FF7A45]">{order.totalAmount} ETB</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{order.items?.length || 0} item(s)</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {order.items?.slice(0, 3).map((item: any) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-300">
                            {item.product?.name} <span className="text-gray-400 dark:text-gray-500">x{item.quantity}</span>
                          </span>
                          <span className="font-medium text-gray-700 dark:text-gray-300">{item.priceAtTime * item.quantity} ETB</span>
                        </div>
                      ))}
                      {order.items?.length > 3 && (
                        <p className="text-sm text-gray-400 dark:text-gray-500">+{order.items.length - 3} more items</p>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700">
                      {order.shippingAddress && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[200px]">
                          📦 {order.shippingAddress}
                        </p>
                      )}

                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    if (activeTab === "jobs") {
      return (
        <Card className="border border-gray-100 dark:border-gray-700 dark:bg-gray-800 rounded-xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl font-bold dark:text-white">Job Opportunities</CardTitle>
            <CardDescription className="dark:text-gray-400">
              Explore job opportunities posted by Scholarship Givers
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            {jobsLoading ? (
              <div className="text-center py-8 dark:text-gray-400">Loading job opportunities...</div>
            ) : !jobOpportunities || jobOpportunities.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No job opportunities available right now</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Check back later for new opportunities</p>
              </div>
            ) : (
              <div className="space-y-4">
                {jobOpportunities.map((job: any) => {
                  const hasApplied = job.hasApplied || job.applications?.some((app: any) => app.studentId === user?.id || app.userId === user?.id);

                  return (
                    <Card key={job.id} className="border border-gray-200 dark:border-gray-700 dark:bg-gray-900/50">
                      <CardContent className="pt-4">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-gray-800 dark:text-gray-100">{job.title}</h3>
                              <Badge className="bg-blue-500">{job.jobType}</Badge>
                              <Badge className="bg-green-500">{job.location}</Badge>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{job.description}</p>
                            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                {job.payment} ETB ({job.paymentType})
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {job.positionsAvailable} position(s)
                              </span>
                              <span className="flex items-center gap-1">
                                <Building className="h-4 w-4" />
                                {job.experienceLevel}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="mt-2">
                              <Badge variant="outline">{job.hobbyCategory}</Badge>
                            </div>
                            {job.requirements && (
                              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                <p className="font-medium">Requirements:</p>
                                <p>{job.requirements}</p>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {hasApplied ? (
                              <Badge className="bg-green-500">Applied</Badge>
                            ) : (
                              <Button
                                size="sm"
                                className="bg-[#FF7A45] hover:bg-[#ff8f61] text-white"
                                onClick={() => {
                                  setApplyingJob(job);
                                  setApplyForm({ fullName: "", email: user?.profile?.email || user?.email || "", phone: "", description: "", cv: null });
                                  setShowApplyModal(true);
                                }}
                                disabled={applyForJobMutation.isPending}
                              >
                                <Send className="h-3 w-3 mr-1" />
                                Apply Now
                              </Button>
                            )}
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              Posted by: {job.organizationName || "Scholarship Giver"}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      { }
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
              <h2 className="text-xl font-bold dark:text-white">Submit Assignment</h2>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmitAssignment} className="space-y-4">
                <div>
                  <Label htmlFor="sub-title">Title *</Label>
                  <Input
                    id="sub-title"
                    value={submissionForm.title}
                    onChange={(e) => setSubmissionForm({ ...submissionForm, title: e.target.value })}
                    placeholder="e.g., Week 1 Homework"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="sub-description">Description</Label>
                  <Textarea
                    id="sub-description"
                    value={submissionForm.description}
                    onChange={(e) => setSubmissionForm({ ...submissionForm, description: e.target.value })}
                    rows={3}
                    placeholder="Brief description of your submission"
                  />
                </div>

                <div>
                  <Label htmlFor="sub-teacher">Select Teacher *</Label>
                  <select
                    id="sub-teacher"
                    className="w-full border dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                    value={submissionForm.teacherId}
                    onChange={(e) => setSubmissionForm({ ...submissionForm, teacherId: e.target.value })}
                    required
                  >
                    <option value="">Select a teacher</option>
                    {teachers?.map((teacher: any) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.profile?.firstName} {teacher.profile?.lastName} ({teacher.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="sub-lesson">Related Lesson (Optional)</Label>
                  <select
                    id="sub-lesson"
                    className="w-full border dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                    value={submissionForm.lessonId}
                    onChange={(e) => setSubmissionForm({ ...submissionForm, lessonId: e.target.value })}
                  >
                    <option value="">Select a lesson</option>
                    {teacherLessons?.map((lesson: any) => (
                      <option key={lesson.id} value={lesson.id}>{lesson.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="sub-file">File (Optional)</Label>
                  <Input
                    id="sub-file"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => setSubmissionForm({ ...submissionForm, file: e.target.files?.[0] || null })}
                  />
                  <p className="text-xs text-gray-400 mt-1">Max 50MB. Allowed: PDF, images, documents</p>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={submitAssignmentMutation.isPending}>
                    <Send className="h-4 w-4 mr-2" />
                    {submitAssignmentMutation.isPending ? "Submitting..." : "Submit Assignment"}
                  </Button>
                  <Button variant="outline" onClick={() => setShowSubmitModal(false)}>Cancel</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 z-20 px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-[#FF7A45]">HobbyHub</Link>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
          {sidebarOpen ? <X className="h-6 w-6 dark:text-gray-200" /> : <Menu className="h-6 w-6 dark:text-gray-200" />}
        </button>
      </div>

      <div className={`fixed inset-y-0 left-0 z-30 w-72 bg-white dark:bg-gray-800 border-r dark:border-gray-700 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b dark:border-gray-700">
            <Link href="/" className="text-2xl font-bold text-[#FF7A45]">HobbyHub</Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Student Portal</p>
          </div>

          <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FF7A45]/10 flex items-center justify-center">
                <span className="text-[#FF7A45] font-bold text-lg">
                  {user?.profile?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "S"}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-100">{user?.profile?.firstName} {user?.profile?.lastName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === item.id ? "bg-[#FF7A45]/10 text-[#FF7A45]" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t dark:border-gray-700 space-y-2">
            <Link href="/" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <Home className="w-5 h-5" /><span className="font-medium">Home</span>
            </Link>
            <Link href="/lessons" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <Video className="w-5 h-5" /><span className="font-medium">Lessons</span>
            </Link>
            <Link href="/chat" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <MessageCircle className="w-5 h-5" /><span className="font-medium">Messages</span>
            </Link>
            <Link href="/settings" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <Settings className="w-5 h-5" /><span className="font-medium">Settings</span>
            </Link>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <LogOut className="w-5 h-5" /><span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="lg:ml-72 min-h-screen">
        <div className="p-6 md:p-8 pt-20 lg:pt-8">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Student Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back, {user?.profile?.firstName || "Student"}!</p>
          </div>
          {renderContent()}
        </div>
      </div>

      {/* Job Application Modal */}
      {showApplyModal && applyingJob && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-auto shadow-2xl">
            <div className="p-6 border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold dark:text-white">Apply for Job</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{applyingJob.title}</p>
                </div>
                <button
                  onClick={() => { setShowApplyModal(false); setApplyingJob(null); }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!applyForm.fullName || !applyForm.email || !applyForm.phone) {
                    toast.error('Please fill in all required fields.');
                    return;
                  }
                  const fd = new FormData();
                  fd.append('fullName', applyForm.fullName);
                  fd.append('email', applyForm.email);
                  fd.append('phone', applyForm.phone);
                  if (applyForm.description) fd.append('description', applyForm.description);
                  if (applyForm.cv) fd.append('cv', applyForm.cv);
                  applyForJobMutation.mutate({ jobId: applyingJob.id, formData: fd });
                }}
                className="space-y-5"
              >
                <div>
                  <Label htmlFor="apply-fullname">Full Name *</Label>
                  <Input
                    id="apply-fullname"
                    value={applyForm.fullName}
                    onChange={(e: any) => setApplyForm({ ...applyForm, fullName: e.target.value })}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="apply-email">Email Address *</Label>
                  <Input
                    id="apply-email"
                    type="email"
                    value={applyForm.email}
                    onChange={(e: any) => setApplyForm({ ...applyForm, email: e.target.value })}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="apply-phone">Phone Number *</Label>
                  <Input
                    id="apply-phone"
                    type="tel"
                    value={applyForm.phone}
                    onChange={(e: any) => setApplyForm({ ...applyForm, phone: e.target.value })}
                    placeholder="+251 9XX XXX XXX"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="apply-cv">CV / Resume (PDF, DOC, DOCX — max 10MB)</Label>
                  <div className="mt-1">
                    {applyForm.cv ? (
                      <div className="flex items-center gap-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-3">
                        <FileText className="h-5 w-5 text-[#FF7A45] flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">{applyForm.cv.name}</span>
                        <button
                          type="button"
                          onClick={() => setApplyForm({ ...applyForm, cv: null })}
                          className="text-red-400 hover:text-red-600 ml-2 flex-shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor="apply-cv-input"
                        className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-700/50 hover:bg-orange-50 dark:hover:bg-orange-900/10 hover:border-[#FF7A45] transition-colors"
                      >
                        <Upload className="h-7 w-7 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">Click to upload or browse</span>
                        <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">PDF, DOC, DOCX up to 10MB</span>
                        <input
                          id="apply-cv-input"
                          type="file"
                          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          className="hidden"
                          onChange={(e: any) => {
                            const file = e.target.files?.[0];
                            if (file) setApplyForm({ ...applyForm, cv: file });
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="apply-desc">Short Description <span className="text-gray-400 dark:text-gray-500 font-normal">(Optional)</span></Label>
                  <Textarea
                    id="apply-desc"
                    value={applyForm.description}
                    onChange={(e: any) => setApplyForm({ ...applyForm, description: e.target.value })}
                    placeholder="Tell the employer a bit about yourself and why you're a great fit..."
                    rows={3}
                  />
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
                  <p className="text-xs text-blue-700 dark:text-blue-300">Your application will be reviewed by the scholarship giver. You will be notified about the status update.</p>
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => { setShowApplyModal(false); setApplyingJob(null); }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-[#FF7A45] hover:bg-[#ff8f61] text-white"
                    disabled={applyForJobMutation.isPending}
                  >
                    {applyForJobMutation.isPending ? (
                      <span className="flex items-center gap-2"><span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />Submitting...</span>
                    ) : (
                      <span className="flex items-center gap-2"><Send className="h-4 w-4" />Submit Application</span>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const Label = ({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
    {children}
  </label>
);

const Input = ({ id, value, onChange, required, placeholder, type = "text", accept }: any) => (
  <input
    id={id}
    type={type}
    value={value}
    onChange={onChange}
    required={required}
    placeholder={placeholder}
    accept={accept}
    className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF7A45]"
  />
);

const Textarea = ({ id, value, onChange, rows = 3, placeholder }: any) => (
  <textarea
    id={id}
    value={value}
    onChange={onChange}
    rows={rows}
    placeholder={placeholder}
    className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF7A45]"
  />
);
