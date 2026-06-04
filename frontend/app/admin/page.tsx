"use client";

import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import api from "../lib/api";
import {
  Users,
  Package,
  BookOpen,
  Calendar as CalendarIcon,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  Plus,
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);

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
    mutationFn: async ({
      userId,
      roleIds,
    }: {
      userId: number;
      roleIds: number[];
    }) => {
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  if (!user?.roles?.includes("admin")) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-red-600">Access Denied. Admin only.</p>
            <Link href="/dashboard">
              <Button className="mt-4">Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleRoleUpdate = () => {
    if (selectedUserId && selectedRoles.length > 0) {
      updateRolesMutation.mutate({
        userId: selectedUserId,
        roleIds: selectedRoles,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-purple-600">
            HobbyHub Admin
          </Link>
          <div className="flex gap-4">
            <Link href="/admin">
              <Button variant="ghost">Admin Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 mb-8">
          Manage users, view analytics, and control platform
        </p>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Users
              </CardTitle>
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
              <CardTitle className="text-sm font-medium text-gray-500">
                Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalStudents || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Teachers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalTeachers || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Sellers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalSellers || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                {stats?.totalRevenue || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">Users Management</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>

          {/* Users Management */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>
                  Manage user accounts, roles, and status
                </CardDescription>
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
                                <span
                                  key={r.role.id}
                                  className="text-xs bg-gray-100 px-2 py-1 rounded"
                                >
                                  {r.role.name}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-3">
                            <span
                              className={`text-xs px-2 py-1 rounded ${user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                            >
                              {user.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className={`text-xs px-2 py-1 rounded ${user.isVerified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                            >
                              {user.isVerified ? "Yes" : "No"}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedUserId(user.id);
                                  setSelectedRoles(
                                    user.roles?.map((r: any) => r.role.id) ||
                                      [],
                                  );
                                }}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              {user.isActive ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-500"
                                  onClick={() =>
                                    deactivateUserMutation.mutate(user.id)
                                  }
                                >
                                  Deactivate
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-500"
                                  onClick={() =>
                                    activateUserMutation.mutate(user.id)
                                  }
                                >
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
          </TabsContent>

          {/* Reports */}
          <TabsContent value="reports">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Report</CardTitle>
                  <CardDescription>Recent orders and revenue</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 text-center py-8">
                    Sales report coming soon
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Lessons Report</CardTitle>
                  <CardDescription>
                    Lesson registrations and attendance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 text-center py-8">
                    Lessons report coming soon
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Content */}
          <TabsContent value="content">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Manage Hobbies</CardTitle>
                  <CardDescription>
                    Add, edit, or remove hobbies
                  </CardDescription>
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
                  <CardDescription>
                    Add, edit, or remove categories
                  </CardDescription>
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
          </TabsContent>
        </Tabs>

        {/* Role Edit Dialog - Simplified */}
        {selectedUserId && roles && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>Edit User Roles</CardTitle>
                <CardDescription>
                  Select roles for user ID: {selectedUserId}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {roles.map((role: any) => (
                    <label
                      key={role.id}
                      className="flex items-center gap-2 p-2 border rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedRoles.includes(role.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRoles([...selectedRoles, role.id]);
                          } else {
                            setSelectedRoles(
                              selectedRoles.filter((id) => id !== role.id),
                            );
                          }
                        }}
                      />
                      <span className="font-medium">{role.name}</span>
                      <span className="text-sm text-gray-500">
                        {role.description}
                      </span>
                    </label>
                  ))}
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleRoleUpdate}
                    disabled={updateRolesMutation.isPending}
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedUserId(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
