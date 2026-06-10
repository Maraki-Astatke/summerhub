"use client";
import React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import api from "@/lib/api";
import {
  Calendar,
  Users,
  BookOpen,
  DollarSign,
  Edit,
  Trash2,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Video,
  ShoppingBag,
  Newspaper,
  Trophy,
  MessageSquare,
  Settings,
  Award,
  Upload,
} from "lucide-react";

const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={`p-6 pb-3 ${className}`}>{children}</div>;

const CardTitle = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>;

const CardDescription = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => <p className={`text-sm text-gray-500 ${className}`}>{children}</p>;

const CardContent = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={`p-6 pt-0 ${className}`}>{children}</div>;

const Button = ({
  children,
  onClick,
  variant = "default",
  className = "",
  disabled = false,
  type = "button",
}: any) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded-lg font-medium transition ${
      variant === "outline"
        ? "border border-gray-300 hover:bg-gray-50"
        : variant === "destructive"
          ? "bg-red-500 text-white hover:bg-red-600"
          : "bg-purple-600 text-white hover:bg-purple-700"
    } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
  >
    {children}
  </button>
);

const Input = ({
  id,
  value,
  onChange,
  required,
  placeholder,
  type = "text",
  accept,
}: any) => (
  <input
    id={id}
    type={type}
    value={value}
    onChange={onChange}
    required={required}
    placeholder={placeholder}
    accept={accept}
    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
  />
);

const Label = ({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) => (
  <label
    htmlFor={htmlFor}
    className="block text-sm font-medium text-gray-700 mb-1"
  >
    {children}
  </label>
);

const Textarea = ({ id, value, onChange, rows = 3, placeholder }: any) => (
  <textarea
    id={id}
    value={value}
    onChange={onChange}
    rows={rows}
    placeholder={placeholder}
    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
  />
);

export default function TeacherDashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, logout } = useAuth();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("lessons");
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [customMessage, setCustomMessage] = useState("");
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    hobbyId: "",
    dateTime: "",
    durationMinutes: "60",
    maxStudents: "20",
    zoomLink: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
    if (!authLoading && user && !user?.roles?.includes("teacher")) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const { data: stats } = useQuery({
    queryKey: ["teacher-stats"],
    queryFn: async () => {
      const response = await api.get("/teacher/stats");
      return response.data;
    },
    enabled: !!user && user?.roles?.includes("teacher"),
  });

  const { data: lessons } = useQuery({
    queryKey: ["teacher-lessons"],
    queryFn: async () => {
      const response = await api.get("/teacher/lessons");
      return response.data;
    },
    enabled: !!user && user?.roles?.includes("teacher"),
  });

  const { data: students } = useQuery({
    queryKey: ["teacher-students"],
    queryFn: async () => {
      const response = await api.get("/teacher/students");
      return response.data;
    },
    enabled: !!user && user?.roles?.includes("teacher"),
  });

  const { data: issuedCertificates } = useQuery({
    queryKey: ["teacher-issued-certificates"],
    queryFn: async () => {
      const response = await api.get("/teacher/certificates/issued");
      return response.data;
    },
    enabled: !!user && user?.roles?.includes("teacher"),
  });

  const { data: hobbies } = useQuery({
    queryKey: ["hobbies-list"],
    queryFn: async () => {
      const response = await api.get("/hobbies?limit=100");
      return response.data.data;
    },
  });

  const uploadCertificateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await api.post("/teacher/certificates/upload", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: () => {
      setCertificateFile(null);
      alert("Certificate uploaded successfully!");
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || "Failed to upload certificate");
    },
  });

  const issueCertificateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post("/teacher/certificates/issue", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["teacher-issued-certificates"],
      });
      setSelectedStudent(null);
      setCustomMessage("");
      alert("Certificate issued successfully!");
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || "Failed to issue certificate");
    },
  });

  const createLessonMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post("/teacher/lessons/create", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-lessons"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-stats"] });
      setActiveTab("lessons");
      setFormData({
        title: "",
        description: "",
        hobbyId: "",
        dateTime: "",
        durationMinutes: "60",
        maxStudents: "20",
        zoomLink: "",
      });
      alert("Lesson created successfully!");
    },
    onError: (error: any) => {
      const data = error.response?.data;
      if (data?.errors) {
        const errorMsgs = data.errors
          .map((e: any) => `${e.path || e.param}: ${e.msg}`)
          .join(", ");
        alert(`Validation failed: ${errorMsgs}`);
      } else {
        alert(data?.error || "Failed to create lesson");
      }
    },
  });

  const updateLessonMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await api.put(`/lessons/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-lessons"] });
      setEditingLesson(null);
      alert("Lesson updated successfully!");
    },
  });

  const deleteLessonMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/lessons/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-lessons"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-stats"] });
      alert("Lesson deleted");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.title.trim().length < 5) {
      alert("Lesson title must be at least 5 characters long");
      return;
    }
    if (!formData.hobbyId) {
      alert("Please select a hobby");
      return;
    }
    if (!formData.dateTime) {
      alert("Please select a date and time");
      return;
    }

    const submitData: any = {
      title: formData.title,
      description: formData.description,
      hobbyId: parseInt(formData.hobbyId),
      dateTime: new Date(formData.dateTime).toISOString(),
      durationMinutes: parseInt(formData.durationMinutes),
      maxStudents: parseInt(formData.maxStudents),
    };

    if (formData.zoomLink) {
      submitData.zoomLink = formData.zoomLink;
    }

    createLessonMutation.mutate(submitData);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLesson) {
      if (!formData.hobbyId) {
        alert("Please select a hobby");
        return;
      }
      if (!formData.dateTime) {
        alert("Please select a date and time");
        return;
      }

      const updateData: any = {
        title: formData.title,
        description: formData.description,
        hobbyId: parseInt(formData.hobbyId),
        dateTime: new Date(formData.dateTime).toISOString(),
        durationMinutes: parseInt(formData.durationMinutes),
        maxStudents: parseInt(formData.maxStudents),
      };

      if (formData.zoomLink) {
        updateData.zoomLink = formData.zoomLink;
      }

      updateLessonMutation.mutate({
        id: editingLesson.id,
        data: updateData,
      });
    }
  };

  const handleUploadCertificate = () => {
    if (!certificateFile) {
      alert("Please select a certificate file");
      return;
    }
    const formData = new FormData();
    formData.append("certificate", certificateFile);
    formData.append("title", "Certificate Template");
    uploadCertificateMutation.mutate(formData);
  };

  const handleIssueCertificate = () => {
    if (!selectedStudent) {
      alert("Please select a student");
      return;
    }
    issueCertificateMutation.mutate({
      studentId: selectedStudent.id,
      customMessage: customMessage,
    });
  };

  const openEditDialog = (lesson: any) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      description: lesson.description || "",
      hobbyId: lesson.hobbyId.toString(),
      dateTime: lesson.dateTime.slice(0, 16),
      durationMinutes: lesson.durationMinutes.toString(),
      maxStudents: lesson.maxStudents.toString(),
      zoomLink: lesson.zoomLink || "",
    });
  };

  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!user || !user?.roles?.includes("teacher")) {
    return null;
  }

  const menuItems = [
    {
      id: "stats",
      label: "Overview",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: "lessons",
      label: "My Lessons",
      icon: <BookOpen className="w-5 h-5" />,
    },
    {
      id: "students",
      label: "My Students",
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: "certificates",
      label: "Certificates",
      icon: <Award className="w-5 h-5" />,
    },
    {
      id: "create",
      label: "Create Lesson",
      icon: <Video className="w-5 h-5" />,
    },
  ];

  const renderContent = () => {
    if (activeTab === "stats") {
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Lessons
              </CardTitle>
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
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2">
                <Users className="h-5 w-5 text-gray-400" />
                {stats?.totalStudents || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Upcoming Lessons
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.upcomingLessons || 0}
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
      );
    }

    if (activeTab === "lessons") {
      return (
        <div className="space-y-4">
          {lessons?.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No lessons created yet</p>
                <Button className="mt-4" onClick={() => setActiveTab("create")}>
                  Create First Lesson
                </Button>
              </CardContent>
            </Card>
          ) : (
            lessons?.map((lesson: any) => (
              <Card key={lesson.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">
                        {lesson.title}
                      </h3>
                      <p className="text-gray-600 mb-3">{lesson.description}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(lesson.dateTime).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>
                            {lesson.registrations?.length || 0} /{" "}
                            {lesson.maxStudents} students
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(lesson)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500"
                        onClick={() => {
                          if (confirm("Delete this lesson?")) {
                            deleteLessonMutation.mutate(lesson.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      );
    }

    if (activeTab === "students") {
      return (
        <Card>
          <CardHeader>
            <CardTitle>My Students</CardTitle>
            <CardDescription>
              Students registered in your lessons
            </CardDescription>
          </CardHeader>
          <CardContent>
            {students?.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No students yet</p>
            ) : (
              <div className="space-y-3">
                {students?.map((student: any) => (
                  <div
                    key={student.id}
                    className="flex justify-between items-center p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {student.profile?.firstName} {student.profile?.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{student.email}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {student.registeredLessons} lesson(s)
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    if (activeTab === "certificates") {
      return (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Certificate</CardTitle>
              <CardDescription>
                Upload a certificate image (JPG, PNG) or PDF
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="certificate-file">Certificate File</Label>
                  <Input
                    id="certificate-file"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) =>
                      setCertificateFile(e.target.files?.[0] || null)
                    }
                  />
                </div>
                <Button
                  onClick={handleUploadCertificate}
                  disabled={
                    !certificateFile || uploadCertificateMutation.isPending
                  }
                >
                  {uploadCertificateMutation.isPending
                    ? "Uploading..."
                    : "Upload Certificate"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Issue Certificate</CardTitle>
              <CardDescription>
                Select a student to issue a certificate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Select Student</Label>
                  <select
                    className="w-full border rounded-md px-3 py-2"
                    value={selectedStudent?.id || ""}
                    onChange={(e) => {
                      const student = students?.find(
                        (s: any) => s.id === parseInt(e.target.value),
                      );
                      setSelectedStudent(student);
                    }}
                  >
                    <option value="">Select a student</option>
                    {students?.map((student: any) => (
                      <option key={student.id} value={student.id}>
                        {student.profile?.firstName} {student.profile?.lastName}{" "}
                        ({student.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>Custom Message (Optional)</Label>
                  <Textarea
                    placeholder="Add a personal message for the student..."
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleIssueCertificate}
                  disabled={!selectedStudent}
                >
                  Issue Certificate
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Issued Certificates</CardTitle>
              <CardDescription>
                View all certificates you've issued
              </CardDescription>
            </CardHeader>
            <CardContent>
              {issuedCertificates?.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No certificates issued yet
                </p>
              ) : (
                <div className="space-y-3">
                  {issuedCertificates?.map((cert: any) => (
                    <div
                      key={cert.id}
                      className="flex justify-between items-center p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{cert.template?.title}</p>
                        <p className="text-sm text-gray-500">
                          Issued to: {cert.student?.profile?.firstName}{" "}
                          {cert.student?.profile?.lastName}
                        </p>
                        <p className="text-xs text-gray-400">
                          Date: {new Date(cert.issuedAt).toLocaleDateString()}
                        </p>
                        {cert.customMessage && (
                          <p className="text-sm text-purple-600 mt-1">
                            "{cert.customMessage}"
                          </p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const token = localStorage.getItem("token");
                          window.open(
                            `http://localhost:5001/api/certificates/${cert.id}/download?token=${token}`,
                            "_blank",
                          );
                        }}
                      >
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    if (activeTab === "create") {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Create New Lesson</CardTitle>
            <CardDescription>
              Add a new lesson for students to join
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Lesson Title</Label>
                <Input
                  id="title"
                  placeholder="Enter a title (minimum 5 characters)"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
                {formData.title.length > 0 && formData.title.length < 5 && (
                  <p className="text-red-500 text-xs mt-1">
                    Title must be at least 5 characters ({formData.title.length}
                    /5)
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="hobbyId">Hobby Category</Label>
                <select
                  id="hobbyId"
                  className="w-full border rounded-md px-3 py-2"
                  value={formData.hobbyId}
                  onChange={(e) =>
                    setFormData({ ...formData, hobbyId: e.target.value })
                  }
                  required
                >
                  <option value="">Select Hobby</option>
                  {hobbies?.map((hobby: any) => (
                    <option key={hobby.id} value={hobby.id}>
                      {hobby.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="dateTime">Date & Time</Label>
                <Input
                  id="dateTime"
                  type="datetime-local"
                  value={formData.dateTime}
                  onChange={(e) =>
                    setFormData({ ...formData, dateTime: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="durationMinutes">Duration (minutes)</Label>
                  <Input
                    id="durationMinutes"
                    type="number"
                    value={formData.durationMinutes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        durationMinutes: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="maxStudents">Max Students</Label>
                  <Input
                    id="maxStudents"
                    type="number"
                    value={formData.maxStudents}
                    onChange={(e) =>
                      setFormData({ ...formData, maxStudents: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="zoomLink">Zoom Link (optional)</Label>
                <Input
                  id="zoomLink"
                  placeholder="https://zoom.us/j/..."
                  value={formData.zoomLink}
                  onChange={(e) =>
                    setFormData({ ...formData, zoomLink: e.target.value })
                  }
                />
              </div>
              <Button type="submit" disabled={createLessonMutation.isPending}>
                {createLessonMutation.isPending
                  ? "Creating..."
                  : "Create Lesson"}
              </Button>
            </form>
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b z-20 px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-purple-600">
          HobbyHub Teacher
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          {sidebarOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      <div
        className={`fixed inset-y-0 left-0 z-30 w-72 bg-white border-r transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b">
            <Link href="/" className="text-2xl font-bold text-purple-600">
              HobbyHub
            </Link>
            <p className="text-sm text-gray-500 mt-1">Teacher Portal</p>
          </div>

          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-purple-600 font-bold text-lg">
                  {user?.profile?.firstName?.[0] ||
                    user?.email?.[0]?.toUpperCase() ||
                    "T"}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-800">
                  {user?.profile?.firstName} {user?.profile?.lastName}
                </p>
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
                    ? "bg-purple-50 text-purple-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t space-y-2">
            <Link
              href="/"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="font-medium">Shop</span>
            </Link>
            <Link
              href="/blog"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Newspaper className="w-5 h-5" />
              <span className="font-medium">Blog</span>
            </Link>
            <Link
              href="/events"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Trophy className="w-5 h-5" />
              <span className="font-medium">Events</span>
            </Link>
            <Link
              href="/chat"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="font-medium">Messages</span>
            </Link>
            <Link
              href="/profile"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
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

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="lg:ml-72 min-h-screen">
        <div className="p-6 md:p-8 pt-20 lg:pt-8">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Teacher Dashboard
            </h1>
            <p className="text-gray-500 mt-1">
              Manage your lessons and students
            </p>
          </div>
          {renderContent()}
        </div>
      </div>

      {editingLesson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-bold">Edit Lesson</h2>
            </div>
            <div className="p-6">
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-hobbyId">Hobby</Label>
                  <select
                    id="edit-hobbyId"
                    className="w-full border rounded-md px-3 py-2"
                    value={formData.hobbyId}
                    onChange={(e) =>
                      setFormData({ ...formData, hobbyId: e.target.value })
                    }
                    required
                  >
                    <option value="">Select Hobby</option>
                    {hobbies?.map((hobby: any) => (
                      <option key={hobby.id} value={hobby.id}>
                        {hobby.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="edit-dateTime">Date & Time</Label>
                  <Input
                    id="edit-dateTime"
                    type="datetime-local"
                    value={formData.dateTime}
                    onChange={(e) =>
                      setFormData({ ...formData, dateTime: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-duration">Duration (minutes)</Label>
                    <Input
                      id="edit-duration"
                      type="number"
                      value={formData.durationMinutes}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          durationMinutes: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-maxStudents">Max Students</Label>
                    <Input
                      id="edit-maxStudents"
                      type="number"
                      value={formData.maxStudents}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxStudents: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-zoomLink">Zoom Link</Label>
                  <Input
                    id="edit-zoomLink"
                    value={formData.zoomLink}
                    onChange={(e) =>
                      setFormData({ ...formData, zoomLink: e.target.value })
                    }
                  />
                </div>
                <div className="flex gap-2 pt-4 sticky bottom-0 bg-white">
                  <Button
                    type="submit"
                    disabled={updateLessonMutation.isPending}
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditingLesson(null)}
                  >
                    Cancel
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
