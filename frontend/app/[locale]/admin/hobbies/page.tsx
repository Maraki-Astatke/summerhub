"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Edit, Trash2, Plus } from "lucide-react";

export default function AdminHobbiesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHobby, setEditingHobby] = useState<any>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [categoryId, setCategoryId] = useState("");

  // Console logs for debugging
  console.log("=== AdminHobbiesPage Debug ===");
  console.log("authLoading:", authLoading);
  console.log("user object:", user);
  console.log("user roles:", user?.roles);
  console.log("is admin?", user?.roles?.includes("admin"));
  console.log("==============================");

  useEffect(() => {
    console.log("useEffect triggered - checking admin access");
    if (!authLoading && (!user || !user?.roles?.includes("admin"))) {
      console.log("Redirecting to dashboard - not admin");
      router.push("/dashboard");
    } else {
      console.log("User is admin, staying on page");
    }
  }, [user, authLoading, router]);

  const { data: hobbies, isLoading } = useQuery({
    queryKey: ["admin-hobbies"],
    queryFn: async () => {
      console.log("Fetching hobbies...");
      const response = await api.get("/hobbies?limit=100");
      console.log("Hobbies response:", response.data);
      return response.data.data;
    },
    enabled: !!user && user?.roles?.includes("admin"),
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      console.log("Fetching categories...");
      const response = await api.get("/categories");
      console.log("Categories response:", response.data);
      return response.data;
    },
    enabled: !!user && user?.roles?.includes("admin"),
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log("Creating hobby:", data);
      const response = await api.post("/admin/hobbies", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-hobbies"] });
      setIsDialogOpen(false);
      resetForm();
      alert("Hobby created successfully");
    },
    onError: (error: any) => {
      console.error("Create hobby error:", error);
      alert(error.response?.data?.error || "Failed to create hobby");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      console.log("Updating hobby:", id, data);
      const response = await api.put(`/admin/hobbies/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-hobbies"] });
      setIsDialogOpen(false);
      setEditingHobby(null);
      resetForm();
      alert("Hobby updated successfully");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log("Deleting hobby:", id);
      await api.delete(`/admin/hobbies/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-hobbies"] });
      alert("Hobby deleted");
    },
  });

  const resetForm = () => {
    setName("");
    setDescription("");
    setAgeGroup("");
    setCategoryId("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name,
      description,
      ageGroup,
      categoryId: categoryId ? parseInt(categoryId) : null,
    };
    if (editingHobby) {
      updateMutation.mutate({ id: editingHobby.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const openEditDialog = (hobby: any) => {
    setEditingHobby(hobby);
    setName(hobby.name);
    setDescription(hobby.description || "");
    setAgeGroup(hobby.ageGroup || "");
    setCategoryId(hobby.categoryId?.toString() || "");
    setIsDialogOpen(true);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!user || !user?.roles?.includes("admin")) {
    console.log("Rendering null - not admin");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manage Hobbies</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  resetForm();
                  setEditingHobby(null);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Hobby
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingHobby ? "Edit Hobby" : "Add Hobby"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Hobby Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="ageGroup">Age Group</Label>
                  <select
                    id="ageGroup"
                    className="w-full border rounded-md px-3 py-2"
                    value={ageGroup}
                    onChange={(e) => setAgeGroup(e.target.value)}
                  >
                    <option value="">Select Age Group</option>
                    <option value="6-9">6-9 years</option>
                    <option value="10-13">10-13 years</option>
                    <option value="14-18">14-18 years</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="categoryId">Category</Label>
                  <select
                    id="categoryId"
                    className="w-full border rounded-md px-3 py-2"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories?.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Button type="submit" className="w-full">
                  {editingHobby ? "Update" : "Create"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hobbies?.map((hobby: any) => (
              <Card key={hobby.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle>{hobby.name}</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(hobby)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500"
                        onClick={() => {
                          if (confirm("Delete this hobby?")) {
                            deleteMutation.mutate(hobby.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    {hobby.description?.substring(0, 100)}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 text-sm">
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      {hobby.ageGroup || "All ages"}
                    </span>
                    {hobby.category && (
                      <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">
                        {hobby.category.name}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}