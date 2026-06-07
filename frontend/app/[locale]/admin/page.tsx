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
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, logout, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("users");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);

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
    { id: "content", label: "Content", icon: <BookOpen className="w-5 h-5" /> },
  ];

  const renderContent = () => {
    if (activeTab === "users") {
      return (
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>Manage user accounts, roles, and status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3">ID</th>
                    <th className="text-left p-3">Email</th>
                    <th className="text-left p-3">Name</th>
                    <th className="text-left p-3">Roles</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Verified</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users?.data?.map((user: any) => (
                    <tr key={user.id} className="border-t hover:bg-gray-50">
                      <td className="p-3">{user.id}</td>
                      <td className="p-3">{user.email}</td>
                      <td className="p-3">
                        {user.profile?.firstName} {user.profile?.lastName}
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {user.roles?.map((r: any) => (
                            <span key={r.role.id} className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {r.role.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`text-xs px-2 py-1 rounded ${user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {user.isActive ? "Active" : "Inactive"}
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
                            <Button size="sm" variant="outline" className="text-red-500" onClick={() => deactivateUserMutation.mutate(user.id)}>
                              Deactivate
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" className="text-green-500" onClick={() => activateUserMutation.mutate(user.id)}>
                              Activate
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (activeTab === "stats") {
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2">
                <Users className="h-5 w-5 text-gray-400" />
                {stats?.totalUsers || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalStudents || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Teachers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalTeachers || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Sellers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalSellers || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2">
                <Package className="h-5 w-5 text-gray-400" />
                {stats?.totalProducts || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Lessons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-gray-400" />
                {stats?.totalLessons || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                {stats?.totalRevenue || 0}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (activeTab === "content") {
      return (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Manage Hobbies</CardTitle>
              <CardDescription>Add, edit, or remove hobbies</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/hobbies">
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Manage Hobbies
                </Button>
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Manage Categories</CardTitle>
              <CardDescription>Add, edit, or remove categories</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/categories">
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Manage Categories
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
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b z-20 px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-purple-600">HobbyHub Admin</Link>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100">
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-72 bg-white border-r transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b">
            <Link href="/" className="text-2xl font-bold text-purple-600">HobbyHub</Link>
            <p className="text-sm text-gray-500 mt-1">Admin Portal</p>
          </div>

          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-purple-600 font-bold text-lg">
                  {user?.profile?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'A'}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-800">{user?.profile?.firstName} {user?.profile?.lastName}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
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
                    ? 'bg-purple-50 text-purple-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t space-y-2">
            
            <Link href="/profile" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
              <Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="lg:ml-72 min-h-screen">
        <div className="p-6 md:p-8 pt-20 lg:pt-8">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage users, view analytics, and control platform</p>
          </div>
          {renderContent()}
        </div>
      </div>

      {/* Role Edit Dialog */}
      {selectedUserId && roles && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Edit User Roles</h2>
              <p className="text-sm text-gray-500">Select roles for user ID: {selectedUserId}</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                {roles.map((role: any) => (
                  <label key={role.id} className="flex items-center gap-2 p-2 border rounded">
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
                    <span className="text-sm text-gray-500">{role.description}</span>
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