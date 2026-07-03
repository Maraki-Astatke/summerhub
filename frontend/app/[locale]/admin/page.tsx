"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  Users,
  Package,
  BookOpen,
  DollarSign,
  Edit,
  Trash2,
  Plus,
  Menu,
  X,
  LayoutDashboard,
  BarChart3,
  ShoppingBag,
  Trophy,
  GraduationCap,
  FileText,
  Briefcase,
  CheckCircle,
  XCircle,
  Clock,
  Gift,
  HandCoins,
  Eye,
  UserCheck,
  UserX,
  Sparkles,
  Heart,
  TrendingUp,
  Award,
  Mail,
  Calendar,
  User,
} from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell,
} from "recharts";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, logout, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("stats");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [userFilter, setUserFilter] = useState<"all" | "pending" | "active">("all");
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [rejectType, setRejectType] = useState<"sponsorship" | "job">("sponsorship");

  const [isQuizDialogOpen, setIsQuizDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [question, setQuestion] = useState('');
  const [showAdminAICertModal, setShowAdminAICertModal] = useState(false);
  const [adminAiCertForm, setAdminAiCertForm] = useState({
    studentName: "",
    studentEmail: "",
    hobbyName: "",
    teacherName: "",
    studentId: null as number | null,
  });

  // ✅ State for student dropdown
  const [students, setStudents] = useState<any[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  useEffect(() => {
    if (activeTab === "quiz-responses") {
      router.push("/admin/quiz-responses");
    } else if (activeTab === "talent-events") {
      router.push("/admin/event-posts");
    }
  }, [activeTab, router]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
    if (!authLoading && user && !user?.roles?.includes("admin")) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  // ✅ Fetch students when the certificate modal opens
  useEffect(() => {
    if (showAdminAICertModal) {
      fetchStudents();
    }
  }, [showAdminAICertModal]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // ✅ Fetch all students for dropdown
  const fetchStudents = async () => {
    setIsLoadingStudents(true);
    try {
      const response = await api.get('/admin/students');
      if (response.data.success) {
        setStudents(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
      toast.error('Failed to load students');
    } finally {
      setIsLoadingStudents(false);
    }
  };

  // ✅ Handle student selection from dropdown - FIXED with functional update
  const handleStudentSelect = (studentId: string) => {
    if (!studentId) return;
    const selectedStudent = students.find(s => String(s.id) === studentId);
    if (selectedStudent) {
      setAdminAiCertForm(prev => ({
        ...prev,
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
        studentEmail: selectedStudent.email
      }));
    }
  };

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const response = await api.get("/admin/stats");
      return response.data;
    },
    enabled: !!user && user?.roles?.includes("admin"),
  });

  const { data: users } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const response = await api.get("/admin/users");
      return response.data;
    },
    enabled: !!user && user?.roles?.includes("admin"),
  });

  const { data: roles } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const response = await api.get("/roles");
      return response.data;
    },
    enabled: !!user && user?.roles?.includes("admin"),
  });

  const { data: questions, isLoading: quizLoading } = useQuery({
    queryKey: ['quiz-questions'],
    queryFn: async () => {
      const response = await api.get('/quiz/questions');
      return response.data;
    },
    enabled: !!user && user?.roles?.includes('admin'),
  });

  const { data: scholarshipGivers } = useQuery({
    queryKey: ["admin-scholarship-givers"],
    queryFn: async () => {
      const response = await api.get("/admin/scholarship-givers");
      return response.data;
    },
    enabled: !!user && user?.roles?.includes("admin"),
  });

  const { data: sponsorships } = useQuery({
    queryKey: ["admin-sponsorships"],
    queryFn: async () => {
      const response = await api.get("/admin/sponsorships");
      return response.data;
    },
    enabled: !!user && user?.roles?.includes("admin"),
  });

  const { data: jobPosts } = useQuery({
    queryKey: ["admin-job-posts"],
    queryFn: async () => {
      const response = await api.get("/admin/job-posts");
      return response.data;
    },
    enabled: !!user && user?.roles?.includes("admin"),
  });

  // ✅ Fetch certificates for the certificates tab
  const { data: certificates, refetch: refetchCertificates } = useQuery({
    queryKey: ["admin-certificates"],
    queryFn: async () => {
      const response = await api.get("/certificates/all");
      return response.data;
    },
    enabled: !!user && user?.roles?.includes("admin"),
  });

  const updateRolesMutation = useMutation({
    mutationFn: async ({ userId, roleIds }: { userId: number; roleIds: number[] }) => {
      await api.put(`/admin/users/${userId}/roles`, { roleIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setSelectedUserId(null);
      toast.success("Roles updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to update roles");
    },
  });

  const activateUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      await api.put(`/admin/users/${userId}/activate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User activated");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to activate user");
    },
  });

  const deactivateUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      await api.put(`/admin/users/${userId}/deactivate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User deactivated");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to deactivate user");
    },
  });

  const approveSponsorshipMutation = useMutation({
    mutationFn: async (sponsorshipId: number) => {
      await api.put(`/admin/sponsorships/${sponsorshipId}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sponsorships"] });
      toast.success("Sponsorship approved!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to approve sponsorship");
    },
  });

  const rejectSponsorshipMutation = useMutation({
    mutationFn: async ({ sponsorshipId, reason }: { sponsorshipId: number; reason: string }) => {
      await api.put(`/admin/sponsorships/${sponsorshipId}/reject`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sponsorships"] });
      toast.success("Sponsorship rejected");
      setShowRejectDialog(false);
      setRejectReason("");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to reject sponsorship");
    },
  });

  const approveJobPostMutation = useMutation({
    mutationFn: async (jobId: number) => {
      await api.put(`/admin/job-posts/${jobId}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-job-posts"] });
      toast.success("Job post approved!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to approve job post");
    },
  });

  const rejectJobPostMutation = useMutation({
    mutationFn: async ({ jobId, reason }: { jobId: number; reason: string }) => {
      await api.put(`/admin/job-posts/${jobId}/reject`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-job-posts"] });
      toast.success("Job post rejected");
      setShowRejectDialog(false);
      setRejectReason("");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to reject job post");
    },
  });

  const createQuizMutation = useMutation({
    mutationFn: async (data: { question: string }) => {
      const response = await api.post('/admin/quiz/questions', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-questions'] });
      setIsQuizDialogOpen(false);
      resetQuizForm();
      toast.success('Question created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create question');
    },
  });

  const updateQuizMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { question: string } }) => {
      const response = await api.put(`/admin/quiz/questions/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-questions'] });
      setIsQuizDialogOpen(false);
      setEditingQuestion(null);
      resetQuizForm();
      toast.success('Question updated successfully!');
    },
  });

  const deleteQuizMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/quiz/questions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-questions'] });
      toast.success('Question deleted');
    },
  });

  const adminIssueAICertificateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post("/certificates/issue", data);
      return { ...response.data, studentEmail: data.studentEmail };
    },
    onSuccess: (data: any) => {
      setShowAdminAICertModal(false);
      toast.success(`✅ Certificate issued and sent to ${data.studentEmail}'s dashboard!`);
      setAdminAiCertForm({ studentName: "", studentEmail: "", hobbyName: "", teacherName: "", studentId: null });
      refetchCertificates();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to issue AI certificate");
    },
  });

  const resetQuizForm = () => {
    setQuestion('');
  };

  const handleQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!question.trim()) {
      toast.error('Question is required');
      return;
    }

    const data = {
      question: question.trim()
    };

    if (editingQuestion) {
      updateQuizMutation.mutate({ id: editingQuestion.id, data });
    } else {
      createQuizMutation.mutate(data);
    }
  };

  const openEditDialog = (q: any) => {
    setEditingQuestion(q);
    setQuestion(q.question);
    setIsQuizDialogOpen(true);
  };

  const handleRoleUpdate = () => {
    if (selectedUserId && selectedRoles.length > 0) {
      updateRolesMutation.mutate({ userId: selectedUserId, roleIds: selectedRoles });
    }
  };

  const openRejectDialog = (id: number, type: "sponsorship" | "job") => {
    setSelectedItemId(id);
    setRejectType(type);
    setRejectReason("");
    setShowRejectDialog(true);
  };

  const handleReject = () => {
    if (!selectedItemId) return;

    if (rejectType === "sponsorship") {
      rejectSponsorshipMutation.mutate({ sponsorshipId: selectedItemId, reason: rejectReason });
    } else if (rejectType === "job") {
      rejectJobPostMutation.mutate({ jobId: selectedItemId, reason: rejectReason });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-500">Rejected</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "inactive":
        return <Badge className="bg-gray-500">Inactive</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!user || !user?.roles?.includes("admin")) {
    return null;
  }

  const menuItems = [
    { id: "stats", label: "Analytics", icon: <BarChart3 className="w-5 h-5" /> },
    { id: "content", label: "Content", icon: <BookOpen className="w-5 h-5" /> },
    { id: "users", label: "User Management", icon: <Users className="w-5 h-5" /> },
    { id: "certificates", label: "Certificates", icon: <Award className="w-5 h-5" /> },
    { id: "quiz", label: "Quiz Management", icon: <GraduationCap className="w-5 h-5" /> },
    { id: "quiz-responses", label: "Quiz Responses", icon: <FileText className="w-5 h-5" /> },
    { id: "talent-events", label: "Manage Talent Events", icon: <Trophy className="w-5 h-5" /> },
    { id: "scholarship-givers", label: "Scholarship Givers", icon: <Users className="w-5 h-5" /> },
    { id: "sponsorships", label: "Sponsorships", icon: <HandCoins className="w-5 h-5" /> },
    { id: "job-posts", label: "Job Posts", icon: <Briefcase className="w-5 h-5" /> },
  ];

  const renderContent = () => {
    if (activeTab === "quiz-responses" || activeTab === "talent-events") {
      return null;
    }

    // ============================================
    // CERTIFICATES TAB - WITH LIST
    // ============================================
    if (activeTab === "certificates") {
      const certificateList = certificates?.data || [];

      return (
        <div className="space-y-6">
          {/* AI Issue Certificate Card */}
          <Card className="border-0 shadow-sm dark:bg-gray-800 dark:border-gray-700 bg-gradient-to-br from-[#FFF2EB] to-white dark:from-gray-800 dark:to-gray-800">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <CardTitle className="text-xl font-bold dark:text-white flex items-center gap-2">
                    <Award className="h-5 w-5 text-[#FF7A45]" />
                    Certificates
                  </CardTitle>

                </div>
                <Button
                  onClick={() => setShowAdminAICertModal(true)}
                  className="bg-[#FF7A45] hover:bg-[#ff8f61] text-white shadow-sm"
                >
                  <Award className="h-4 w-4 mr-2" />
                  Issue Certificate
                </Button>
              </div>
            </CardHeader>

          </Card>

          {/* ✅ Certificate List */}
          <Card className="border-0 shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="dark:text-white flex items-center gap-2">
                    <Award className="h-5 w-5 text-[#FF7A45]" />
                    Issued Certificates
                  </CardTitle>

                </div>
                <Badge className="bg-[#FF7A45] text-white">
                  {certificateList.length} Total
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {certificateList.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto bg-[#FF7A45]/10 rounded-full flex items-center justify-center mb-4">
                    <Award className="h-8 w-8 text-[#FF7A45]" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-base">No certificates issued yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Click "Issue AI Certificate" to create your first one
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="dark:text-gray-300">
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3" />
                            Student
                          </div>
                        </TableHead>
                        <TableHead className="dark:text-gray-300">
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3" />
                            Email
                          </div>
                        </TableHead>
                        <TableHead className="dark:text-gray-300">Hobby / Course</TableHead>
                        <TableHead className="dark:text-gray-300">Teacher</TableHead>
                        <TableHead className="dark:text-gray-300">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            Issued On
                          </div>
                        </TableHead>
                        <TableHead className="dark:text-gray-300">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {certificateList.map((cert: any) => (
                        <TableRow key={cert.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <TableCell className="font-medium dark:text-gray-100">
                            {cert.recipient?.name || cert.studentName || "N/A"}
                          </TableCell>
                          <TableCell className="dark:text-gray-300">
                            {cert.recipient?.email || cert.studentEmail || "N/A"}
                          </TableCell>
                          <TableCell className="dark:text-gray-300">
                            {cert.hobbyName || cert.metadata?.hobby || cert.customAttributes?.hobby || "N/A"}
                          </TableCell>
                          <TableCell className="dark:text-gray-300">
                            {cert.teacherName || cert.metadata?.teacher || cert.customAttributes?.teacher || "N/A"}
                          </TableCell>
                          <TableCell className="dark:text-gray-300">
                            {cert.issuedOn ? new Date(cert.issuedOn).toLocaleDateString() : "N/A"}
                          </TableCell>
                          <TableCell>
                            <Badge className={cert.status === "issued" ? "bg-green-500" : "bg-yellow-500"}>
                              {cert.status || "issued"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    if (activeTab === "users") {
      const filteredUsers = users?.data?.filter((u: any) => {
        if (userFilter === "pending") return !u.isActive;
        if (userFilter === "active") return u.isActive;
        return true;
      }) || [];

      return (
        <Card className="dark:bg-gray-800 dark:border-gray-700 border-0 shadow-sm">
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 space-y-4 md:space-y-0">
            <div>
              <CardTitle className="dark:text-white">User Management</CardTitle>
              <CardDescription className="dark:text-gray-400">Manage user accounts, roles, and approvals</CardDescription>
            </div>
            <div className="flex gap-2 bg-gray-100 dark:bg-gray-900 p-1 rounded-lg self-start md:self-auto">
              <button
                onClick={() => setUserFilter("all")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${userFilter === "all"
                  ? "bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
              >
                All ({users?.data?.length || 0})
              </button>
              <button
                onClick={() => setUserFilter("pending")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${userFilter === "pending"
                  ? "bg-white dark:bg-gray-800 text-yellow-600 dark:text-yellow-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
              >
                Pending ({users?.data?.filter((u: any) => !u.isActive).length || 0})
              </button>
              <button
                onClick={() => setUserFilter("active")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${userFilter === "active"
                  ? "bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
              >
                Active ({users?.data?.filter((u: any) => u.isActive).length || 0})
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="text-left p-3 dark:text-gray-300">ID</th>
                    <th className="text-left p-3 dark:text-gray-300">Email</th>
                    <th className="text-left p-3 dark:text-gray-300">Name</th>
                    <th className="text-left p-3 dark:text-gray-300">Roles</th>
                    <th className="text-left p-3 dark:text-gray-300">Status</th>
                    <th className="text-left p-3 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center p-8 text-gray-500 dark:text-gray-400">
                        No users found matching this filter.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user: any) => (
                      <tr key={user.id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="p-3 dark:text-gray-300">{user.id}</td>
                        <td className="p-3 dark:text-gray-300">{user.email}</td>
                        <td className="p-3 dark:text-gray-300">
                          {user.profile?.firstName} {user.profile?.lastName}
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {user.roles?.map((r: any) => (
                              <span key={r.role.id} className="text-xs bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                                {r.role.name}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`text-xs px-2 py-1 rounded font-semibold ${user.isActive ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"}`}>
                            {user.isActive ? "Active" : "Pending"}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => {
                              setSelectedUserId(user.id);
                              setSelectedRoles(user.roles?.map((r: any) => r.role.id) || []);
                            }}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            {user.isActive ? (
                              <Button size="sm" variant="outline" className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20" onClick={() => deactivateUserMutation.mutate(user.id)}>
                                Deactivate
                              </Button>
                            ) : (
                              <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => activateUserMutation.mutate(user.id)}>
                                Approve
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      );
    }

    // ============================================
    // ANALYTICS / STATS - MATCHING STUDENT DASHBOARD
    // ============================================
    if (activeTab === "stats") {
      const chartData = [
        { name: "Users", value: stats?.totalUsers || 0, color: "#FF7A45" },
        { name: "Students", value: stats?.totalStudents || 0, color: "#FF9966" },
        { name: "Teachers", value: stats?.totalTeachers || 0, color: "#FFB899" },
        { name: "Sellers", value: stats?.totalSellers || 0, color: "#FFD4B8" },
      ];

      return (
        <div className="space-y-6">
          {/* Stats Cards - Matching Student Dashboard Style */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { label: "Total Users", value: stats?.totalUsers || 0, icon: <Users className="h-6 w-6 text-[#FF7A45]" /> },
              { label: "Students", value: stats?.totalStudents || 0, icon: <GraduationCap className="h-6 w-6 text-[#FF7A45]" /> },
              { label: "Teachers", value: stats?.totalTeachers || 0, icon: <BookOpen className="h-6 w-6 text-[#FF7A45]" /> },
              { label: "Sellers", value: stats?.totalSellers || 0, icon: <ShoppingBag className="h-6 w-6 text-[#FF7A45]" /> },
            ].map((stat, i) => (
              <Card key={i} className="border-0 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#FF7A45]/10 rounded-xl flex-shrink-0">
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-800 dark:text-white mt-0.5">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Chart + Quick Stats Side by Side - Like Student Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
            {/* Chart - 4 columns */}
            <Card className="lg:col-span-4 border-0 shadow-sm dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold dark:text-white">📊 Platform Overview</CardTitle>
                <CardDescription className="text-base dark:text-gray-400">Users, Students, Teachers, Sellers</CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 14 }} />
                    <YAxis tick={{ fontSize: 14 }} />
                    <Bar dataKey="value" barSize={40} radius={[6, 6, 0, 0]} activeBar={false} isAnimationActive={false}>
                      {chartData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Quick Stats - 3 columns (like student dashboard) */}
            <Card className="lg:col-span-3 border-0 shadow-sm dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold dark:text-white">📊 Quick Stats</CardTitle>
                <CardDescription className="text-base dark:text-gray-400">Platform metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#FF7A45]/20 flex items-center justify-center">
                      <Package className="h-5 w-5 text-[#FF7A45]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Products</p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats?.totalProducts || 0}</p>
                    </div>
                  </div>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#FF7A45]/20 flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-[#FF7A45]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Lessons</p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats?.totalLessons || 0}</p>
                    </div>
                  </div>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#FF7A45]/20 flex items-center justify-center">
                      <ShoppingBag className="h-5 w-5 text-[#FF7A45]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Orders</p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats?.totalOrders || 0}</p>
                    </div>
                  </div>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#FF7A45]/20 flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-[#FF7A45]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Revenue</p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-white">${stats?.totalRevenue || 0}</p>
                    </div>
                  </div>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    if (activeTab === "quiz") {
      return (
        <Card className="border-0 shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Quiz Management</CardTitle>
              <CardDescription>Create and manage interest assessment questions</CardDescription>
            </div>
            <Dialog open={isQuizDialogOpen} onOpenChange={setIsQuizDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetQuizForm(); setEditingQuestion(null); }} className="bg-[#FF7A45] hover:bg-[#ff8f61]">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>{editingQuestion ? 'Edit Question' : 'Add New Question'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleQuizSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="question">Question</Label>
                    <Textarea
                      id="question"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="e.g., What activity makes you lose track of time?"
                      rows={3}
                      required
                      className="resize-none"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Students will answer this question with text responses
                    </p>
                  </div>

                  <Button type="submit" className="w-full bg-[#FF7A45] hover:bg-[#ff8f61]">
                    {editingQuestion ? 'Update Question' : 'Create Question'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {quizLoading ? (
              <div className="text-center py-12">Loading...</div>
            ) : questions?.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No quiz questions yet</p>
                <Button className="mt-4 bg-[#FF7A45] hover:bg-[#ff8f61]" onClick={() => setIsQuizDialogOpen(true)}>
                  Create First Question
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {questions?.map((q: any, idx: number) => (
                  <Card key={q.id} className="border dark:border-gray-700">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#FF7A45]/10 flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-[#FF7A45] font-bold text-sm">{idx + 1}</span>
                          </div>
                          <div>
                            <CardTitle className="text-lg text-gray-800 dark:text-white">{q.question}</CardTitle>
                            <span className="text-xs text-gray-400 mt-1 inline-block">
                              Students answer with written responses
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(q)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500"
                            onClick={() => {
                              if (confirm('Delete this question?')) {
                                deleteQuizMutation.mutate(q.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    if (activeTab === "content") {
      return (
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: "Manage Hobbies", desc: "Add, edit, or remove hobbies and discover new categories", href: "/admin/hobbies", icon: <Sparkles className="h-8 w-8 text-[#FF7A45]" /> },
            { title: "Manage Categories", desc: "Add, edit, or remove hobby categories for organization", href: "/admin/categories", icon: <BookOpen className="h-8 w-8 text-[#FF7A45]" /> },
            { title: "Manage Product Categories", desc: "Add, edit, or remove marketplace categories for sellers", href: "/admin/product-categories", icon: <Package className="h-8 w-8 text-[#FF7A45]" /> },
          ].map((item, i) => (
            <Card key={i} className="dark:bg-gray-800 dark:border-gray-700 border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-8 flex flex-col items-center text-center gap-4">
                <div className="p-4 bg-[#FF7A45]/10 rounded-2xl">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold dark:text-white">{item.title}</h3>
                  <p className="text-base text-gray-500 dark:text-gray-400 mt-1">{item.desc}</p>
                </div>
                <Link href={item.href} className="w-full">
                  <Button className="w-full bg-[#FF7A45] hover:bg-[#ff8f61] text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Manage
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (activeTab === "scholarship-givers") {
      return (
        <Card className="dark:bg-gray-800 dark:border-gray-700 border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="dark:text-white">Scholarship Givers</CardTitle>
            <CardDescription className="dark:text-gray-400">View all registered scholarship givers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="dark:text-gray-300">Name</TableHead>
                    <TableHead className="dark:text-gray-300">Email</TableHead>
                    <TableHead className="dark:text-gray-300">Organization</TableHead>
                    <TableHead className="dark:text-gray-300">Status</TableHead>
                    <TableHead className="dark:text-gray-300">Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scholarshipGivers?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No scholarship givers registered yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    scholarshipGivers?.map((giver: any) => (
                      <TableRow key={giver.id}>
                        <TableCell className="font-medium dark:text-gray-100">
                          {giver.profile?.firstName} {giver.profile?.lastName}
                        </TableCell>
                        <TableCell className="dark:text-gray-300">{giver.email}</TableCell>
                        <TableCell className="dark:text-gray-300">{giver.organization || "N/A"}</TableCell>
                        <TableCell>{getStatusBadge(giver.isActive ? "active" : "inactive")}</TableCell>
                        <TableCell className="dark:text-gray-300">
                          {new Date(giver.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (activeTab === "sponsorships") {
      return (
        <Card className="dark:bg-gray-800 dark:border-gray-700 border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="dark:text-white">Sponsorships</CardTitle>
            <CardDescription className="dark:text-gray-400">
              Review and manage event sponsorships from scholarship givers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="dark:text-gray-300">Scholarship Giver</TableHead>
                    <TableHead className="dark:text-gray-300">Event</TableHead>
                    <TableHead className="dark:text-gray-300">Amount</TableHead>
                    <TableHead className="dark:text-gray-300">Type</TableHead>
                    <TableHead className="dark:text-gray-300">Status</TableHead>
                    <TableHead className="dark:text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sponsorships?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No sponsorships yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    sponsorships?.map((sponsorship: any) => (
                      <TableRow key={sponsorship.id}>
                        <TableCell className="dark:text-gray-300">
                          {sponsorship.giver?.profile?.firstName} {sponsorship.giver?.profile?.lastName}
                        </TableCell>
                        <TableCell className="dark:text-gray-300">{sponsorship.event?.title}</TableCell>
                        <TableCell className="dark:text-gray-300">{sponsorship.amount} ETB</TableCell>
                        <TableCell className="dark:text-gray-300">{sponsorship.sponsorType}</TableCell>
                        <TableCell>{getStatusBadge(sponsorship.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {sponsorship.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-green-500 hover:bg-green-600 text-white"
                                  onClick={() => approveSponsorshipMutation.mutate(sponsorship.id)}
                                  disabled={approveSponsorshipMutation.isPending}
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => openRejectDialog(sponsorship.id, "sponsorship")}
                                >
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                            {sponsorship.status !== "pending" && (
                              <Badge className={sponsorship.status === "approved" ? "bg-green-500" : "bg-red-500"}>
                                {sponsorship.status}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (activeTab === "job-posts") {
      return (
        <Card className="dark:bg-gray-800 dark:border-gray-700 border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="dark:text-white">Job Posts</CardTitle>
            <CardDescription className="dark:text-gray-400">
              Review and manage job posts from scholarship givers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="dark:text-gray-300">Title</TableHead>
                    <TableHead className="dark:text-gray-300">Scholarship Giver</TableHead>
                    <TableHead className="dark:text-gray-300">Category</TableHead>
                    <TableHead className="dark:text-gray-300">Type</TableHead>
                    <TableHead className="dark:text-gray-300">Status</TableHead>
                    <TableHead className="dark:text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobPosts?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No job posts yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    jobPosts?.map((job: any) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium dark:text-gray-100">{job.title}</TableCell>
                        <TableCell className="dark:text-gray-300">
                          {job.giver?.profile?.firstName} {job.giver?.profile?.lastName}
                        </TableCell>
                        <TableCell className="dark:text-gray-300">{job.hobbyCategory}</TableCell>
                        <TableCell className="dark:text-gray-300">{job.jobType}</TableCell>
                        <TableCell>{getStatusBadge(job.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {job.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-green-500 hover:bg-green-600 text-white"
                                  onClick={() => approveJobPostMutation.mutate(job.id)}
                                  disabled={approveJobPostMutation.isPending}
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => openRejectDialog(job.id, "job")}
                                >
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                            {job.status !== "pending" && (
                              <Badge className={job.status === "approved" ? "bg-green-500" : "bg-red-500"}>
                                {job.status}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-[#1F2937]">
      <DashboardHeader
        user={user}
        logout={logout}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        roleName="Administrator"
      />

      <div className={`fixed top-16 bottom-0 left-0 z-30 w-72 bg-white dark:bg-gray-800 border-r dark:border-gray-700 transform transition-transform duration-300 lg:translate-x-0 overflow-y-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <nav className="flex-1 p-4 pt-5 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-base font-medium ${activeTab === item.id
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
          {activeTab === "stats" && (
            <div className="mb-7">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h1>
              <p className="text-base text-gray-500 dark:text-gray-400 mt-1">Manage users, quiz, analytics, and control platform</p>
            </div>
          )}
          {renderContent()}
        </div>
      </div>

      {selectedUserId && roles && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full mx-4">
            <div className="p-6 border-b dark:border-gray-700">
              <h2 className="text-xl font-bold dark:text-white">Edit User Roles</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Select roles for user ID: {selectedUserId}</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                {roles.map((role: any) => (
                  <label key={role.id} className="flex items-center gap-2 p-2 border dark:border-gray-700 rounded dark:text-gray-200">
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(role.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRoles([...selectedRoles, role.id]);
                        } else {
                          setSelectedRoles(selectedRoles.filter((id) => id !== role.id));
                        }
                      }}
                    />
                    <span className="font-medium">{role.name}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{role.description}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleRoleUpdate} disabled={updateRolesMutation.isPending}>
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setSelectedUserId(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject {rejectType === "sponsorship" ? "Sponsorship" : "Job Post"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Reason for Rejection</Label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Please provide a reason for rejection..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={handleReject}
                disabled={rejectSponsorshipMutation.isPending || rejectJobPostMutation.isPending}
              >
                Confirm Rejection
              </Button>
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Admin AI Certificate Modal with Student Dropdown - FIXED */}
      {showAdminAICertModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full shadow-2xl">
            <div className="p-6 border-b dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FF7A45]/10 flex items-center justify-center">
                    <Award className="h-5 w-5 text-[#FF7A45]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold dark:text-white">Issue AI Certificate</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Powered by Certifier AI</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAdminAICertModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {/* ✅ Student Dropdown - FIXED */}
              <div>
                <Label htmlFor="admin-ai-student-select">Select Student</Label>
                <select
                  id="admin-ai-student-select"
                  className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#FF7A45]"
                  onChange={(e) => {
                    const studentId = e.target.value;
                    if (studentId) {
                      handleStudentSelect(studentId);
                    }
                  }}
                  value={adminAiCertForm.studentEmail ? students.find(s => s.email === adminAiCertForm.studentEmail)?.id || "" : ""}
                >
                  <option value="">-- Select a student --</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} ({student.email})
                    </option>
                  ))}
                </select>
                {isLoadingStudents && (
                  <p className="text-xs text-gray-400 mt-1">Loading students...</p>
                )}
              </div>

              <div className="border-t dark:border-gray-700 pt-4">
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">Or manually enter details below</p>
              </div>

              <div>
                <Label htmlFor="admin-ai-student-name">Student Full Name *</Label>
                <Input
                  id="admin-ai-student-name"
                  value={adminAiCertForm.studentName}
                  onChange={(e) => setAdminAiCertForm({ ...adminAiCertForm, studentName: e.target.value })}
                  placeholder="e.g., Abebe Kebede"
                />
              </div>
              <div>
                <Label htmlFor="admin-ai-student-email">Student Email *</Label>
                <Input
                  id="admin-ai-student-email"
                  type="email"
                  value={adminAiCertForm.studentEmail}
                  onChange={(e) => setAdminAiCertForm({ ...adminAiCertForm, studentEmail: e.target.value })}
                  placeholder="student@example.com"
                />
              </div>
              <div>
                <Label htmlFor="admin-ai-hobby-name">Hobby / Course Name *</Label>
                <Input
                  id="admin-ai-hobby-name"
                  value={adminAiCertForm.hobbyName}
                  onChange={(e) => setAdminAiCertForm({ ...adminAiCertForm, hobbyName: e.target.value })}
                  placeholder="e.g., Guitar Playing"
                />
              </div>
              <div>
                <Label htmlFor="admin-ai-teacher-name">Instructor / Teacher Name</Label>
                <Input
                  id="admin-ai-teacher-name"
                  value={adminAiCertForm.teacherName}
                  onChange={(e) => setAdminAiCertForm({ ...adminAiCertForm, teacherName: e.target.value })}
                  placeholder="e.g., Marta Tesfaye"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => {
                    if (!adminAiCertForm.studentName || !adminAiCertForm.studentEmail || !adminAiCertForm.hobbyName) {
                      toast.error("Please fill in student name, email, and hobby name");
                      return;
                    }
                    adminIssueAICertificateMutation.mutate({
                      studentName: adminAiCertForm.studentName,
                      studentEmail: adminAiCertForm.studentEmail,
                      hobbyName: adminAiCertForm.hobbyName,
                      teacherName: adminAiCertForm.teacherName,
                      studentId: adminAiCertForm.studentId,
                    });
                  }}
                  disabled={adminIssueAICertificateMutation.isPending}
                  className="flex-1 bg-[#FF7A45] hover:bg-[#ff8f61]"
                >
                  <Award className="h-4 w-4 mr-2" />
                  {adminIssueAICertificateMutation.isPending ? "Issuing..." : "Issue Certificate"}
                </Button>
                <Button variant="outline" onClick={() => setShowAdminAICertModal(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}