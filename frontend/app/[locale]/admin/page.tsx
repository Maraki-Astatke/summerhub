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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import api from "@/lib/api";
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
  LogOut,
  LayoutDashboard,
  BarChart3,
  Settings,
  ShoppingBag,
  Newspaper,
  Trophy,
  MessageSquare,
  Globe,
  Home,
  HelpCircle,
  GraduationCap,
  FileText,
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, logout, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("users");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [userFilter, setUserFilter] = useState<"all" | "pending" | "active">("all");
  
  // Quiz state - SIMPLIFIED (no isActive)
  const [isQuizDialogOpen, setIsQuizDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [question, setQuestion] = useState('');

  // Redirect for quiz-responses tab
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

  const handleLogout = () => {
    logout();
    router.push("/");
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

  // Quiz queries - SIMPLIFIED
  const { data: questions, isLoading: quizLoading } = useQuery({
    queryKey: ['quiz-questions'],
    queryFn: async () => {
      const response = await api.get('/quiz/questions');
      return response.data;
    },
    enabled: !!user && user?.roles?.includes('admin'),
  });

  const updateRolesMutation = useMutation({
    mutationFn: async ({ userId, roleIds }: { userId: number; roleIds: number[] }) => {
      await api.put(`/admin/users/${userId}/roles`, { roleIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setSelectedUserId(null);
      alert("Roles updated successfully");
    },
  });

  const activateUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      await api.put(`/admin/users/${userId}/activate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      alert("User activated");
    },
  });

  const deactivateUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      await api.put(`/admin/users/${userId}/deactivate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      alert("User deactivated");
    },
  });

  // Quiz mutations - SIMPLIFIED (no isActive)
  const createQuizMutation = useMutation({
    mutationFn: async (data: { question: string }) => {
      const response = await api.post('/admin/quiz/questions', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-questions'] });
      setIsQuizDialogOpen(false);
      resetQuizForm();
      alert('Question created successfully!');
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Failed to create question');
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
      alert('Question updated successfully!');
    },
  });

  const deleteQuizMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/quiz/questions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-questions'] });
      alert('Question deleted');
    },
  });

  const resetQuizForm = () => {
    setQuestion('');
  };

  const handleQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) {
      alert('Question is required');
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
    { id: "users", label: "User Management", icon: <Users className="w-5 h-5" /> },
    { id: "stats", label: "Analytics", icon: <BarChart3 className="w-5 h-5" /> },
    { id: "quiz", label: "Quiz Management", icon: <GraduationCap className="w-5 h-5" /> },
    { id: "quiz-responses", label: "Quiz Responses", icon: <FileText className="w-5 h-5" /> },
    { id: "content", label: "Content", icon: <BookOpen className="w-5 h-5" /> },
    { id: "talent-events", label: "Manage Talent Events", icon: <Trophy className="w-5 h-5" /> },
  ];

  const renderContent = () => {
    // Quiz responses and talent-events handled by useEffect - just return null
    if (activeTab === "quiz-responses" || activeTab === "talent-events") {
      return null;
    }

    if (activeTab === "users") {
      const filteredUsers = users?.data?.filter((u: any) => {
        if (userFilter === "pending") return !u.isActive;
        if (userFilter === "active") return u.isActive;
        return true;
      }) || [];

      return (
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 space-y-4 md:space-y-0">
            <div>
              <CardTitle className="dark:text-white">User Management</CardTitle>
              <CardDescription className="dark:text-gray-400">Manage user accounts, roles, and approvals</CardDescription>
            </div>
            <div className="flex gap-2 bg-gray-100 dark:bg-gray-900 p-1 rounded-lg self-start md:self-auto">
              <button
                onClick={() => setUserFilter("all")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  userFilter === "all"
                    ? "bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                All ({users?.data?.length || 0})
              </button>
              <button
                onClick={() => setUserFilter("pending")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  userFilter === "pending"
                    ? "bg-white dark:bg-gray-800 text-yellow-600 dark:text-yellow-400 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                Pending Approval ({users?.data?.filter((u: any) => !u.isActive).length || 0})
              </button>
              <button
                onClick={() => setUserFilter("active")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  userFilter === "active"
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
                    <th className="text-left p-3 dark:text-gray-300">Verified</th>
                    <th className="text-left p-3 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center p-8 text-gray-500 dark:text-gray-400">
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
                            {user.isActive ? "Active" : "Pending Approval"}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`text-xs px-2 py-1 rounded ${user.isVerified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                            {user.isVerified ? "Yes" : "No"}
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

    if (activeTab === "stats") {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold dark:text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-gray-400" />
                  {stats?.totalUsers || 0}
                </div>
              </CardContent>
            </Card>
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold dark:text-white">{stats?.totalStudents || 0}</div>
              </CardContent>
            </Card>
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Teachers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold dark:text-white">{stats?.totalTeachers || 0}</div>
              </CardContent>
            </Card>
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Sellers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold dark:text-white">{stats?.totalSellers || 0}</div>
              </CardContent>
            </Card>
          </div>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Business Metrics</CardTitle>
              <CardDescription className="dark:text-gray-400">Overview of platform products, lessons, orders, and revenue stats</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                      <th className="text-left p-3 dark:text-gray-300">Metric</th>
                      <th className="text-left p-3 dark:text-gray-300">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="p-3 dark:text-gray-300 font-medium flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-400" />
                        Products
                      </td>
                      <td className="p-3 dark:text-gray-300">{stats?.totalProducts || 0}</td>
                    </tr>
                    <tr className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="p-3 dark:text-gray-300 font-medium flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-gray-400" />
                        Lessons
                      </td>
                      <td className="p-3 dark:text-gray-300">{stats?.totalLessons || 0}</td>
                    </tr>
                    <tr className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="p-3 dark:text-gray-300 font-medium flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4 text-gray-400" />
                        Orders
                      </td>
                      <td className="p-3 dark:text-gray-300">{stats?.totalOrders || 0}</td>
                    </tr>
                    <tr className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="p-3 dark:text-gray-300 font-medium flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        Revenue
                      </td>
                      <td className="p-3 dark:text-gray-300 font-semibold text-green-600 dark:text-green-400">
                        ${stats?.totalRevenue || 0}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (activeTab === "quiz") {
      return (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Quiz Management</CardTitle>
              <CardDescription>Create and manage interest assessment questions</CardDescription>
            </div>
            <Dialog open={isQuizDialogOpen} onOpenChange={setIsQuizDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetQuizForm(); setEditingQuestion(null); }} className="bg-purple-600 hover:bg-purple-700">
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
                  
                  <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
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
                <Button className="mt-4 bg-purple-600 hover:bg-purple-700" onClick={() => setIsQuizDialogOpen(true)}>
                  Create First Question
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {questions?.map((q: any, idx: number) => (
                  <Card key={q.id} className="border">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-purple-600 font-bold text-sm">{idx + 1}</span>
                          </div>
                          <div>
                            <CardTitle className="text-lg text-gray-800">{q.question}</CardTitle>
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
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Manage Hobbies</CardTitle>
              <CardDescription className="dark:text-gray-400">Add, edit, or remove hobbies</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/hobbies">
                <Button variant="outline" className="w-full dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Manage Hobbies
                </Button>
              </Link>
            </CardContent>
          </Card>
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Manage Categories</CardTitle>
              <CardDescription className="dark:text-gray-400">Add, edit, or remove hobby categories</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/categories">
                <Button variant="outline" className="w-full dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Manage Categories
                </Button>
              </Link>
            </CardContent>
          </Card>
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Manage Product Categories</CardTitle>
              <CardDescription className="dark:text-gray-400">Add, edit, or remove marketplace categories for sellers</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/product-categories">
                <Button variant="outline" className="w-full dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Manage Product Categories
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 z-20 px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-purple-600 dark:text-purple-400">HobbyHub Admin</Link>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
          {sidebarOpen ? <X className="h-6 w-6 dark:text-gray-200" /> : <Menu className="h-6 w-6 dark:text-gray-200" />}
        </button>
      </div>

      <div className={`fixed inset-y-0 left-0 z-30 w-72 bg-white dark:bg-gray-800 border-r dark:border-gray-700 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b dark:border-gray-700">
            <Link href="/" className="text-2xl font-bold text-purple-600 dark:text-purple-400">HobbyHub</Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Admin Portal</p>
          </div>

          <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                <span className="text-purple-600 dark:text-purple-400 font-bold text-lg">
                  {user?.profile?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'A'}
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
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t dark:border-gray-700 space-y-2">
            <Link href="/settings" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <Settings className="w-5 h-5" /><span className="font-medium">Settings</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="lg:ml-72 min-h-screen">
        <div className="p-6 md:p-8 pt-20 lg:pt-8">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage users, quiz, analytics, and control platform</p>
          </div>
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
    </div>
  );
}