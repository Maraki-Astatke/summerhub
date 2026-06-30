"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/providers/auth-provider";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Calendar,
  DollarSign,
  FileText,
  Menu,
  X,
  Award,
  ClipboardList,
  Briefcase,
  Building,
  MapPin,
  Search,
  Star,
  TrendingUp,
  UserCheck,
  Gift,
  HandCoins,
  Sparkles,
  LayoutDashboard,
  Download,
} from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell,
} from "recharts";

export default function ScholarshipGiverDashboard() {
  const router = useRouter();
  const { user, logout, isLoading: authLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [mySponsorships, setMySponsorships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [jobApplications, setJobApplications] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isSponsorDialogOpen, setIsSponsorDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterHobby, setFilterHobby] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [sponsorFormData, setSponsorFormData] = useState({
    amount: "",
    sponsorType: "financial",
    message: "",
  });

  const [editingJobId, setEditingJobId] = useState(null);

  const [jobFormData, setJobFormData] = useState({
    title: "",
    description: "",
    hobbyCategory: "",
    jobType: "part-time",
    location: "remote",
    payment: "",
    paymentType: "one-time",
    requirements: "",
    experienceLevel: "any",
    positionsAvailable: "1",
    applicationDeadline: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
    if (!authLoading && user && !user?.roles?.includes("scholarship_giver") && !user?.roles?.includes("admin")) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventsRes, sponsorshipsRes, jobAppsRes, studentsRes, jobsRes] = await Promise.all([
        api.get("/event-posts"),
        api.get("/scholarship-giver/sponsorships"),
        api.get("/scholarship-giver/job-applications"),
        api.get("/scholarship-giver/students"),
        api.get("/scholarship-giver/jobs"),
      ]);
      setEvents(Array.isArray(eventsRes.data) ? eventsRes.data : eventsRes.data?.data || eventsRes.data?.events || []);
      setMySponsorships(sponsorshipsRes.data || []);
      setJobApplications(jobAppsRes.data || []);
      setStudents(studentsRes.data || []);
      setJobs(jobsRes.data || []);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleSponsorEvent = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post(`/scholarship-giver/sponsor/${selectedEvent.id}`, sponsorFormData);
      toast.success("Event sponsored successfully!");
      setIsSponsorDialogOpen(false);
      setSponsorFormData({ amount: "", sponsorType: "financial", message: "" });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to sponsor event");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingJobId) {
        await api.put(`/scholarship-giver/jobs/${editingJobId}`, jobFormData);
        toast.success("Job updated successfully! Pending admin re-approval.");
      } else {
        await api.post("/scholarship-giver/jobs", jobFormData);
        toast.success("Job posted successfully!");
      }
      setIsJobDialogOpen(false);
      setEditingJobId(null);
      setJobFormData({
        title: "",
        description: "",
        hobbyCategory: "",
        jobType: "part-time",
        location: "remote",
        payment: "",
        paymentType: "one-time",
        requirements: "",
        experienceLevel: "any",
        positionsAvailable: "1",
        applicationDeadline: "",
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to save job");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditJobClick = (job) => {
    setEditingJobId(job.id);
    setJobFormData({
      title: job.title || "",
      description: job.description || "",
      hobbyCategory: job.hobbyCategory || "",
      jobType: job.jobType || "part-time",
      location: job.location || "remote",
      payment: job.payment ? String(job.payment) : "",
      paymentType: job.paymentType || "one-time",
      requirements: job.requirements || "",
      experienceLevel: job.experienceLevel || "any",
      positionsAvailable: job.positionsAvailable ? String(job.positionsAvailable) : "1",
      applicationDeadline: job.applicationDeadline ? new Date(job.applicationDeadline).toISOString().split('T')[0] : "",
    });
    setIsJobDialogOpen(true);
  };

  const handleDeleteJob = async (id) => {
    if (!confirm("Are you sure you want to delete this job posting?")) return;
    try {
      await api.delete(`/scholarship-giver/jobs/${id}`);
      toast.success("Job deleted successfully!");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to delete job");
    }
  };

  const handleJobApplicationUpdate = async (id, status) => {
    try {
      await api.put(`/scholarship-giver/job-applications/${id}`, { status });
      toast.success(`Application ${status} successfully!`);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update application");
    }
  };

  const openSponsorDialog = (event) => {
    setSelectedEvent(event);
    setIsSponsorDialogOpen(true);
  };

  const openViewDialog = (event) => {
    setSelectedEvent(event);
    setIsViewDialogOpen(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-[#FF7A45] text-white text-sm px-3 py-1">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-500 text-white text-sm px-3 py-1">Rejected</Badge>;
      case "pending":
        return <Badge className="bg-[#FFD4B8] text-[#FF7A45] font-semibold text-sm px-3 py-1">Pending</Badge>;
      case "hired":
        return <Badge className="bg-[#FF7A45] text-white text-sm px-3 py-1">Hired</Badge>;
      case "shortlisted":
        return <Badge className="bg-[#FFB899] text-white text-sm px-3 py-1">Shortlisted</Badge>;
      case "sponsored":
        return <Badge className="bg-[#FF7A45] text-white text-sm px-3 py-1">Sponsored</Badge>;
      default:
        return <Badge className="bg-gray-400 text-white text-sm px-3 py-1">{status}</Badge>;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-[#FF7A45]" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-[#FFB899]" />;
      case "hired":
        return <UserCheck className="h-4 w-4 text-[#FF7A45]" />;
      default:
        return null;
    }
  };

  const getJobTypeBadge = (type) => {
    switch (type) {
      case "full-time":
        return <Badge className="bg-[#FF7A45] text-white text-sm">Full Time</Badge>;
      case "part-time":
        return <Badge className="bg-[#FFB899] text-white text-sm">Part Time</Badge>;
      case "freelance":
        return <Badge className="bg-[#FF9966] text-white text-sm">Freelance</Badge>;
      case "internship":
        return <Badge className="bg-[#FFD4B8] text-[#FF7A45] font-semibold text-sm">Internship</Badge>;
      case "apprenticeship":
        return <Badge className="bg-[#FF8C5A] text-white text-sm">Apprenticeship</Badge>;
      default:
        return <Badge className="bg-gray-400 text-white text-sm">{type}</Badge>;
    }
  };

  const getLocationBadge = (location) => {
    switch (location) {
      case "remote":
        return <Badge className="bg-[#FF7A45] text-white text-sm">Remote</Badge>;
      case "in-person":
        return <Badge className="bg-[#FF9966] text-white text-sm">In-Person</Badge>;
      case "hybrid":
        return <Badge className="bg-[#FFB899] text-white text-sm">Hybrid</Badge>;
      default:
        return <Badge className="bg-gray-400 text-white text-sm">{location}</Badge>;
    }
  };

  const filteredStudents = students.filter((student) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (student.profile?.firstName?.toLowerCase() || "").includes(searchLower) ||
      (student.profile?.lastName?.toLowerCase() || "").includes(searchLower) ||
      (student.email?.toLowerCase() || "").includes(searchLower);
    const matchesHobby = filterHobby === "all" || student.hobbies?.some(h => h.name === filterHobby);
    return matchesSearch && matchesHobby;
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF7A45] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || (!user?.roles?.includes("scholarship_giver") && !user?.roles?.includes("admin"))) {
    return null;
  }

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: "jobs", label: "My Job Posts", icon: <Briefcase className="w-5 h-5" /> },
    { id: "students", label: "Talent Discovery", icon: <Users className="w-5 h-5" /> },

    { id: "job-applications", label: "Job Applications", icon: <ClipboardList className="w-5 h-5" /> },
    { id: "event-sponsorships", label: "Event Sponsorships", icon: <Gift className="w-5 h-5" /> },
  ];

  const stats = {
    totalEvents: events.length,
    totalSponsored: mySponsorships.length,
    totalJobs: jobs.length,
    totalJobApplications: jobApplications.length,
    pendingJobApplications: jobApplications.filter(a => a.status === "pending").length,
    hiredStudents: jobApplications.filter(a => a.status === "hired").length,
    totalStudents: students.length,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-[#1F2937]">
      {/* Unified Top Header */}
      <DashboardHeader
        user={user}
        logout={logout}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        roleName="Scholarship Giver"
      />

      {/* Sidebar */}
      <div className={`fixed top-16 bottom-0 left-0 z-30 w-72 bg-white dark:bg-gray-800 border-r dark:border-gray-700 transform transition-transform duration-300 lg:translate-x-0 overflow-y-auto ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex flex-col h-full">
          <nav className="flex-1 p-4 pt-5 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-base font-medium ${
                  activeTab === item.id
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

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="lg:ml-72 pt-16 min-h-screen">
        <div className="p-6 md:p-8">
          <div className="mb-7">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Scholarship Giver Dashboard</h1>
            <p className="text-base text-gray-500 dark:text-gray-400 mt-1">Support students, sponsor events, and discover talent</p>
          </div>

          {activeTab === "dashboard" && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-7">
                {[
                  { label: "Events Sponsored", value: stats.totalSponsored, icon: <Gift className="h-6 w-6 text-[#FF7A45]" /> },
                  { label: "Jobs Posted", value: stats.totalJobs, icon: <Briefcase className="h-6 w-6 text-[#FF7A45]" /> },
                  { label: "Students Hired", value: stats.hiredStudents, icon: <UserCheck className="h-6 w-6 text-[#FF7A45]" /> },
                  { label: "Pending Job Apps", value: stats.pendingJobApplications, icon: <Clock className="h-6 w-6 text-[#FF7A45]" /> },
                ].map((stat, i) => (
                  <Card key={i} className="dark:bg-gray-800 dark:border-gray-700 border-0 shadow-sm hover:shadow-md transition-shadow">
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

              {/* Chart + Top Students */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="dark:bg-gray-800 dark:border-gray-700 border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold dark:text-white">Recent Job Applications</CardTitle>
                    <CardDescription className="text-sm dark:text-gray-400">Application status overview</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {jobApplications.length === 0 ? (
                      <div className="flex items-center justify-center h-48 text-gray-400">
                        <p className="text-base">No applications yet</p>
                      </div>
                    ) : (
                      <>
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart
                            data={[
                              { name: "Pending", count: jobApplications.filter(a => a.status === "pending").length },
                              { name: "Shortlisted", count: jobApplications.filter(a => a.status === "shortlisted").length },
                              { name: "Hired", count: jobApplications.filter(a => a.status === "hired").length },
                              { name: "Rejected", count: jobApplications.filter(a => a.status === "rejected").length },
                            ]}
                            margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 13 }} />
                            <YAxis tick={{ fontSize: 13 }} />
                            <Bar dataKey="count" radius={[6, 6, 0, 0]} activeBar={false} isAnimationActive={false}>
                              {["#FFD4B8", "#FFB899", "#FF7A45", "#FF5555"].map((color, idx) => (
                                <Cell key={idx} fill={color} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                        <div className="mt-3 space-y-2">
                          {jobApplications.slice(0, 4).map((app) => (
                            <div key={app.id} className="flex justify-between items-center py-2.5 px-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                              <div>
                                <p className="text-base font-medium dark:text-gray-100">{app.student?.profile?.firstName} {app.student?.profile?.lastName}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{app.job?.title}</p>
                              </div>
                              {getStatusBadge(app.status)}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card className="dark:bg-gray-800 dark:border-gray-700 border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold dark:text-white">Top Students</CardTitle>
                    <CardDescription className="text-sm dark:text-gray-400">Talented students to discover</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {students.length === 0 ? (
                      <div className="flex items-center justify-center h-48 text-gray-400">
                        <p className="text-base">No students yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {students.slice(0, 5).map((student) => (
                          <div key={student.id} className="flex justify-between items-center py-3 px-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#FF7A45]/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-[#FF7A45] font-bold">{student.profile?.firstName?.[0] || "S"}</span>
                              </div>
                              <div>
                                <p className="text-base font-medium dark:text-gray-100">{student.profile?.firstName} {student.profile?.lastName}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{student.hobbies?.map(h => h.name).join(", ") || "No hobbies"}</p>
                              </div>
                            </div>
                            <Button size="sm" variant="outline" className="text-sm" onClick={() => setSelectedStudent(student)}>View</Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          { }
          { }
          { }
          {activeTab === "students" && (
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle className="dark:text-white">Talent Discovery</CardTitle>
                    <CardDescription className="dark:text-gray-400">Browse student profiles, portfolios, and vlogs</CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 w-full sm:w-48"
                      />
                    </div>
                    <select
                      value={filterHobby}
                      onChange={(e) => setFilterHobby(e.target.value)}
                      className="border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                    >
                      <option value="all">All Hobbies</option>
                      <option value="music">Music</option>
                      <option value="art">Art</option>
                      <option value="coding">Coding</option>
                      <option value="photography">Photography</option>
                      <option value="writing">Writing</option>
                      <option value="dance">Dance</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredStudents.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No students found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredStudents.map((student) => (
                      <Card key={student.id} className="border border-gray-200 dark:border-gray-700 dark:bg-gray-900/50 hover:shadow-md transition-all">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-[#FF7A45]/10 flex items-center justify-center">
                                <span className="text-[#FF7A45] font-bold text-lg">
                                  {student.profile?.firstName?.[0] || student.email?.[0]?.toUpperCase() || "S"}
                                </span>
                              </div>
                              <div>
                                <h3 className="font-semibold dark:text-gray-100">{student.profile?.firstName} {student.profile?.lastName}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{student.email}</p>
                              </div>
                            </div>
                            <Button size="sm" variant="outline" className="text-xs" onClick={() => setSelectedStudent(student)}>
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          </div>
                          <div className="mt-3">
                            <div className="flex flex-wrap gap-1">
                              {student.hobbies?.map((hobby) => (
                                <Badge key={hobby.id} variant="outline" className="text-xs">
                                  {hobby.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span>Progress: {student.progress || "Beginner"}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          { }
          { }
          { }
          {activeTab === "jobs" && (
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 space-y-4 md:space-y-0">
                <div>
                  <CardTitle className="dark:text-white">My Job Posts</CardTitle>
                  <CardDescription className="dark:text-gray-400">Post and manage job opportunities for students</CardDescription>
                </div>
                <Button className="bg-[#FF7A45] hover:bg-[#ff8f61] text-white" onClick={() => setIsJobDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Post New Job
                </Button>
              </CardHeader>
              <CardContent>
                {jobs.length === 0 ? (
                  <div className="text-center py-12">
                    <Briefcase className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No jobs posted yet</p>
                    <Button
                      onClick={() => setIsJobDialogOpen(true)}
                      className="mt-4 bg-[#FF7A45] hover:bg-[#ff8f61] text-white"
                    >
                      Post Your First Job
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {jobs.map((job) => (
                      <Card key={job.id} className="border border-gray-200 dark:border-gray-700 dark:bg-gray-900/50">
                        <CardContent className="pt-4">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold dark:text-gray-100">{job.title}</h3>
                                {getJobTypeBadge(job.jobType)}
                                {getLocationBadge(job.location)}
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
                              </div>
                              <div className="mt-2">
                                <Badge variant="outline">{job.hobbyCategory}</Badge>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditJobClick(job)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => handleDeleteJob(job.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          { }
          { }
          { }
          {activeTab === "job-applications" && (
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Job Applications</CardTitle>
                <CardDescription className="dark:text-gray-400">Review student applications for your job posts</CardDescription>
              </CardHeader>
              <CardContent>
                {jobApplications.length === 0 ? (
                  <div className="text-center py-12">
                    <ClipboardList className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No job applications received yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="dark:text-gray-300">Applicant</TableHead>
                          <TableHead className="dark:text-gray-300">Job</TableHead>
                          <TableHead className="dark:text-gray-300">CV</TableHead>
                          <TableHead className="dark:text-gray-300">Applied Date</TableHead>
                          <TableHead className="dark:text-gray-300">Status</TableHead>
                          <TableHead className="dark:text-gray-300">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {jobApplications.map((app) => (
                          <TableRow key={app.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium dark:text-gray-100">
                                  {app.fullName || `${app.student?.profile?.firstName || ''} ${app.student?.profile?.lastName || ''}`.trim() || 'N/A'}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{app.email || app.student?.email}</p>
                                {app.phone && (
                                  <p className="text-xs text-gray-400 dark:text-gray-500">{app.phone}</p>
                                )}
                                {app.description && (
                                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 italic line-clamp-1">{app.description}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="dark:text-gray-300">{app.job?.title}</TableCell>
                            <TableCell className="dark:text-gray-300">
                              {app.cvUrl ? (
                                <a
                                  href={`http://localhost:5001${app.cvUrl}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-sm text-[#FF7A45] hover:underline font-medium"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                  {app.cvName || 'Download CV'}
                                </a>
                              ) : (
                                <span className="text-xs text-gray-400 dark:text-gray-500">No CV</span>
                              )}
                            </TableCell>
                            <TableCell className="dark:text-gray-300">
                              {new Date(app.appliedAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(app.status)}
                                {getStatusBadge(app.status)}
                              </div>
                            </TableCell>
                            <TableCell>
                              {app.status === "pending" && (
                                <div className="flex flex-wrap gap-2">
                                  <Button
                                    size="sm"
                                    className="bg-green-500 hover:bg-green-600 text-white"
                                    onClick={() => handleJobApplicationUpdate(app.id, "shortlisted")}
                                  >
                                    Shortlist
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="bg-[#FF7A45] hover:bg-[#FF7A45] text-white"
                                    onClick={() => handleJobApplicationUpdate(app.id, "hired")}
                                  >
                                    Hire
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleJobApplicationUpdate(app.id, "rejected")}
                                  >
                                    Reject
                                  </Button>
                                </div>
                              )}
                              {app.status !== "pending" && (
                                <span className="text-sm text-gray-500 dark:text-gray-400">Reviewed</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          { }
          { }
          { }
          {activeTab === "event-sponsorships" && (
            <div className="space-y-6">
              { }
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="dark:text-white">My Sponsorships</CardTitle>
                  <CardDescription className="dark:text-gray-400">Events you have sponsored</CardDescription>
                </CardHeader>
                <CardContent>
                  {mySponsorships.length === 0 ? (
                    <div className="text-center py-8">
                      <Gift className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">You haven't sponsored any events yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {mySponsorships.map((sponsorship) => (
                        <Card key={sponsorship.id} className="border border-gray-200 dark:border-gray-700 dark:bg-gray-900/50">
                          <CardContent className="pt-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold dark:text-gray-100">{sponsorship.event?.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                  {sponsorship.event?.about || sponsorship.event?.description || "No description"}
                                </p>
                              </div>
                              {getStatusBadge(sponsorship.status || "sponsored")}
                            </div>
                            <div className="flex items-center gap-4 mt-3 text-sm">
                              <span className="flex items-center text-gray-600 dark:text-gray-400">
                                <DollarSign className="h-4 w-4 mr-1" />
                                {sponsorship.amount} ETB
                              </span>
                              <span className="flex items-center text-gray-600 dark:text-gray-400">
                                <Calendar className="h-4 w-4 mr-1" />
                                {sponsorship.event?.date || (sponsorship.event?.startDate ? new Date(sponsorship.event.startDate).toLocaleDateString() : "No date")}
                              </span>
                              <span className="flex items-center text-gray-600 dark:text-gray-400">
                                <MapPin className="h-4 w-4 mr-1" />
                                {sponsorship.event?.location || "Virtual"}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              { }
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="dark:text-white">Available Events to Sponsor</CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Monthly talent events created by admins that need sponsorship
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {events.length === 0 ? (
                    <div className="text-center py-12">
                      <Sparkles className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">No events available for sponsorship right now</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {events.map((event) => (
                        <Card key={event.id} className="border border-gray-200 dark:border-gray-700 dark:bg-gray-900/50 hover:shadow-md transition-all">
                          <CardContent className="pt-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-semibold dark:text-gray-100">{event.title}</h3>
                                  <Badge className="bg-[#FF7A45] text-white text-sm">{event.eventType || "Talent Event"}</Badge>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                  {event.about || event.description || "No description"}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                className="bg-[#FF7A45] hover:bg-[#ff8f61] text-white ml-2"
                                onClick={() => openSponsorDialog(event)}
                              >
                                <HandCoins className="h-3 w-3 mr-1" />
                                Sponsor
                              </Button>
                            </div>
                            <div className="flex items-center gap-4 mt-3 text-sm">
                              <span className="flex items-center text-gray-600 dark:text-gray-400">
                                <Calendar className="h-4 w-4 mr-1" />
                                {event.date || (event.startDate ? new Date(event.startDate).toLocaleDateString() : "No date")}
                              </span>
                              <span className="flex items-center text-gray-600 dark:text-gray-400">
                                <Users className="h-4 w-4 mr-1" />
                                {event.registrations?.length || 0} registered
                              </span>
                              <span className="flex items-center text-gray-600 dark:text-gray-400">
                                <MapPin className="h-4 w-4 mr-1" />
                                {event.location || "Virtual"}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      { }
      { }
      { }
      <Dialog open={isSponsorDialogOpen} onOpenChange={setIsSponsorDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Sponsor Event</DialogTitle>
            <DialogDescription>
              Support the talent event: <strong>{selectedEvent?.title}</strong>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSponsorEvent} className="space-y-4 mt-4">
            <div>
              <Label>Sponsorship Amount (ETB) *</Label>
              <Input
                type="number"
                value={sponsorFormData.amount}
                onChange={(e) => setSponsorFormData({ ...sponsorFormData, amount: e.target.value })}
                placeholder="e.g., 5000"
                required
              />
            </div>

            <div>
              <Label>Sponsorship Type *</Label>
              <select
                value={sponsorFormData.sponsorType}
                onChange={(e) => setSponsorFormData({ ...sponsorFormData, sponsorType: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                required
              >
                <option value="financial">Financial</option>
                <option value="material">Material (Supplies/Equipment)</option>
                <option value="labor">Labor/Volunteer</option>
                <option value="attendance">Attendance (Judge/Guest)</option>
              </select>
            </div>

            <div>
              <Label>Message (Optional)</Label>
              <Textarea
                value={sponsorFormData.message}
                onChange={(e) => setSponsorFormData({ ...sponsorFormData, message: e.target.value })}
                placeholder="Any message about your sponsorship..."
                rows={3}
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300 flex items-start gap-2">
                <Info className="h-4 w-4 mt-0.5" />
                Your sponsorship will be reviewed by an admin before being confirmed.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#FF7A45] hover:bg-[#ff8f61]"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Sponsor Event"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      { }
      { }
      { }
      <Dialog open={isJobDialogOpen} onOpenChange={(open) => {
        setIsJobDialogOpen(open);
        if (!open) {
          setEditingJobId(null);
          setJobFormData({
            title: "",
            description: "",
            hobbyCategory: "",
            jobType: "part-time",
            location: "remote",
            payment: "",
            paymentType: "one-time",
            requirements: "",
            experienceLevel: "any",
            positionsAvailable: "1",
            applicationDeadline: "",
          });
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingJobId ? "Edit Job Opportunity" : "Post a Job Opportunity"}</DialogTitle>
            <DialogDescription>
              {editingJobId ? "Update your job post details." : "Offer work to talented students. All hiring goes through admin approval."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateJob} className="space-y-4 mt-4">
            <div>
              <Label>Job Title *</Label>
              <Input
                value={jobFormData.title}
                onChange={(e) => setJobFormData({ ...jobFormData, title: e.target.value })}
                placeholder="e.g., Graphic Designer, Music Producer"
                required
              />
            </div>

            <div>
              <Label>Description *</Label>
              <Textarea
                value={jobFormData.description}
                onChange={(e) => setJobFormData({ ...jobFormData, description: e.target.value })}
                placeholder="Describe the work opportunity..."
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Hobby Category *</Label>
                <select
                  value={jobFormData.hobbyCategory}
                  onChange={(e) => setJobFormData({ ...jobFormData, hobbyCategory: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="music">Music</option>
                  <option value="art">Art</option>
                  <option value="coding">Coding</option>
                  <option value="photography">Photography</option>
                  <option value="writing">Writing</option>
                  <option value="dance">Dance</option>
                  <option value="game-design">Game Design</option>
                  <option value="video-editing">Video Editing</option>
                </select>
              </div>

              <div>
                <Label>Job Type *</Label>
                <select
                  value={jobFormData.jobType}
                  onChange={(e) => setJobFormData({ ...jobFormData, jobType: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                  required
                >
                  <option value="part-time">Part-time</option>
                  <option value="full-time">Full-time</option>
                  <option value="freelance">Freelance</option>
                  <option value="internship">Internship</option>
                  <option value="apprenticeship">Apprenticeship</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Location *</Label>
                <select
                  value={jobFormData.location}
                  onChange={(e) => setJobFormData({ ...jobFormData, location: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                  required
                >
                  <option value="remote">Remote</option>
                  <option value="in-person">In-Person (Addis Ababa)</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <Label>Payment (ETB) *</Label>
                <Input
                  type="number"
                  value={jobFormData.payment}
                  onChange={(e) => setJobFormData({ ...jobFormData, payment: e.target.value })}
                  placeholder="e.g., 5000"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Payment Type *</Label>
                <select
                  value={jobFormData.paymentType}
                  onChange={(e) => setJobFormData({ ...jobFormData, paymentType: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                  required
                >
                  <option value="one-time">One-time</option>
                  <option value="hourly">Hourly</option>
                  <option value="monthly">Monthly</option>
                  <option value="project-based">Project-based</option>
                </select>
              </div>

              <div>
                <Label>Experience Level</Label>
                <select
                  value={jobFormData.experienceLevel}
                  onChange={(e) => setJobFormData({ ...jobFormData, experienceLevel: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                >
                  <option value="any">Any</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Positions Available</Label>
                <Input
                  type="number"
                  value={jobFormData.positionsAvailable}
                  onChange={(e) => setJobFormData({ ...jobFormData, positionsAvailable: e.target.value })}
                  placeholder="e.g., 3"
                  min="1"
                />
              </div>

              <div>
                <Label>Application Deadline *</Label>
                <Input
                  type="datetime-local"
                  value={jobFormData.applicationDeadline}
                  onChange={(e) => setJobFormData({ ...jobFormData, applicationDeadline: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label>Requirements</Label>
              <Textarea
                value={jobFormData.requirements}
                onChange={(e) => setJobFormData({ ...jobFormData, requirements: e.target.value })}
                placeholder="List specific skills, experience, portfolio requirements..."
                rows={3}
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300 flex items-start gap-2">
                <Info className="h-4 w-4 mt-0.5" />
                All hiring goes through admin approval to ensure safety and prevent scams.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#FF7A45] hover:bg-[#ff8f61]"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : (editingJobId ? "Save Changes" : "Post Job Opportunity")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold dark:text-white">Student Details</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-4 border-b pb-4 dark:border-gray-700">
                <div className="w-16 h-16 rounded-full bg-[#FF7A45]/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#FF7A45] font-bold text-2xl">
                    {selectedStudent.profile?.firstName?.[0] || selectedStudent.email?.[0]?.toUpperCase() || "S"}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold dark:text-gray-100">
                    {selectedStudent.profile?.firstName || "No name"} {selectedStudent.profile?.lastName || ""}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedStudent.email}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Progress: {selectedStudent.progress || "Beginner"}</p>
                </div>
              </div>

              {selectedStudent.profile?.bio && (
                <div>
                  <h4 className="font-semibold text-sm dark:text-gray-200">About / Bio</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border dark:border-gray-800">
                    {selectedStudent.profile.bio}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border dark:border-gray-800">
                <div>
                  <span className="text-gray-400 dark:text-gray-500 block text-xs">City</span>
                  <span className="font-medium dark:text-gray-200">{selectedStudent.profile?.city || "Not specified"}</span>
                </div>
                <div>
                  <span className="text-gray-400 dark:text-gray-500 block text-xs">School / Org</span>
                  <span className="font-medium dark:text-gray-200">{selectedStudent.profile?.schoolName || "Not specified"}</span>
                </div>
                <div>
                  <span className="text-gray-400 dark:text-gray-500 block text-xs">Grade</span>
                  <span className="font-medium dark:text-gray-200">{selectedStudent.profile?.grade || "Not specified"}</span>
                </div>
                <div>
                  <span className="text-gray-400 dark:text-gray-500 block text-xs">Age</span>
                  <span className="font-medium dark:text-gray-200">{selectedStudent.profile?.age || "Not specified"}</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm dark:text-gray-200 mb-2">Registered Hobbies</h4>
                {selectedStudent.hobbies?.length === 0 ? (
                  <p className="text-xs text-gray-400 dark:text-gray-500">No hobbies registered yet</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedStudent.hobbies?.map((hobby) => (
                      <Badge key={hobby.id} variant="outline" className="text-xs">
                        {hobby.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2">
                <Button className="w-full bg-[#FF7A45] hover:bg-[#ff8f61]" onClick={() => setSelectedStudent(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

const Video = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const Info = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
