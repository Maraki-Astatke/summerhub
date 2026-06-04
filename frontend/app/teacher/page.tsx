'use client';
import React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth-provider';
import api from '../lib/api';
import { Calendar, Users, BookOpen, DollarSign, Edit, Trash2 } from 'lucide-react';

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-lg border shadow-sm ${className}`}>{children}</div>
);

const CardHeader = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pb-3 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
);

const CardDescription = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <p className={`text-sm text-gray-500 ${className}`}>{children}</p>
);

const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);

const Button = ({ children, onClick, variant = 'default', className = '', disabled = false, type = 'button' }: any) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded-lg font-medium transition ${
      variant === 'outline' 
        ? 'border border-gray-300 hover:bg-gray-50' 
        : variant === 'destructive'
        ? 'bg-red-500 text-white hover:bg-red-600'
        : 'bg-purple-600 text-white hover:bg-purple-700'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
  >
    {children}
  </button>
);

const Input = ({ id, value, onChange, required, placeholder, type = 'text' }: any) => (
  <input
    id={id}
    type={type}
    value={value}
    onChange={onChange}
    required={required}
    placeholder={placeholder}
    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
  />
);

const Label = ({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">
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

const Tabs = ({ defaultValue, children, className = '' }: any) => {
  const [activeTab, setActiveTab] = useState(defaultValue);
  return (
    <div className={className}>
      {React.Children.map(children, (child) => {
        if (child.type === TabsList) {
          return React.cloneElement(child, { activeTab, setActiveTab });
        }
        if (child.type === TabsContent && child.props.value === activeTab) {
          return child;
        }
        return null;
      })}
    </div>
  );
};

const TabsList = ({ children, activeTab, setActiveTab }: any) => (
  <div className="flex gap-2 border-b mb-6">
    {React.Children.map(children, (child) => {
      if (child.type === TabsTrigger) {
        return React.cloneElement(child, { activeTab, setActiveTab });
      }
      return null;
    })}
  </div>
);

const TabsTrigger = ({ value, children, activeTab, setActiveTab }: any) => (
  <button
    onClick={() => setActiveTab(value)}
    className={`px-4 py-2 font-medium transition ${
      activeTab === value 
        ? 'text-purple-600 border-b-2 border-purple-600' 
        : 'text-gray-500 hover:text-gray-700'
    }`}
  >
    {children}
  </button>
);

const TabsContent = ({ children, value }: any) => <div>{children}</div>;

export default function TeacherDashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    hobbyId: '',
    dateTime: '',
    durationMinutes: '60',
    maxStudents: '20',
    zoomLink: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
    if (!authLoading && user && !user?.roles?.includes('teacher')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const { data: stats } = useQuery({
    queryKey: ['teacher-stats'],
    queryFn: async () => {
      const response = await api.get('/teacher/stats');
      return response.data;
    },
    enabled: !!user && user?.roles?.includes('teacher'),
  });

  const { data: lessons } = useQuery({
    queryKey: ['teacher-lessons'],
    queryFn: async () => {
      const response = await api.get('/teacher/lessons');
      return response.data;
    },
    enabled: !!user && user?.roles?.includes('teacher'),
  });

  const { data: students } = useQuery({
    queryKey: ['teacher-students'],
    queryFn: async () => {
      const response = await api.get('/teacher/students');
      return response.data;
    },
    enabled: !!user && user?.roles?.includes('teacher'),
  });

  const { data: hobbies } = useQuery({
    queryKey: ['hobbies-list'],
    queryFn: async () => {
      const response = await api.get('/hobbies?limit=100');
      return response.data.data;
    },
  });

  const createLessonMutation = useMutation({
    mutationFn: async (data: any) => {
    const response = await api.post('/teacher/lessons/create', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-lessons'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-stats'] });
      setShowCreateForm(false);
      setFormData({
        title: '',
        description: '',
        hobbyId: '',
        dateTime: '',
        durationMinutes: '60',
        maxStudents: '20',
        zoomLink: '',
      });
      alert('Lesson created successfully!');
    },
    onError: (error: any) => {
      const data = error.response?.data;
      if (data?.errors) {
        const errorMsgs = data.errors.map((e: any) => `${e.path || e.param}: ${e.msg}`).join(', ');
        alert(`Validation failed: ${errorMsgs}`);
      } else {
        alert(data?.error || 'Failed to create lesson');
      }
    },
  });

  const updateLessonMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await api.put(`/lessons/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-lessons'] });
      setEditingLesson(null);
      alert('Lesson updated successfully!');
    },
    onError: (error: any) => {
      const data = error.response?.data;
      if (data?.errors) {
        const errorMsgs = data.errors.map((e: any) => `${e.path || e.param}: ${e.msg}`).join(', ');
        alert(`Validation failed: ${errorMsgs}`);
      } else {
        alert(data?.error || 'Failed to update lesson');
      }
    },
  });

  const deleteLessonMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/lessons/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-lessons'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-stats'] });
      alert('Lesson deleted');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.title.trim().length < 5) {
      alert('Lesson title must be at least 5 characters long');
      return;
    }
    if (!formData.hobbyId) {
      alert('Please select a hobby');
      return;
    }
    if (!formData.dateTime) {
      alert('Please select a date and time');
      return;
    }

    const submitData: any = {
      title: formData.title,
      description: formData.description,
      hobbyId: parseInt(formData.hobbyId),
      dateTime: new Date(formData.dateTime).toISOString(),
      durationMinutes: parseInt(formData.durationMinutes),
      maxStudents: parseInt(formData.maxStudents)
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
        alert('Please select a hobby');
        return;
      }
      if (!formData.dateTime) {
        alert('Please select a date and time');
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!user || !user?.roles?.includes('teacher')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-purple-600">HobbyHub Teacher</Link>
          <div className="flex gap-4">
            <Link href="/teacher">
              <Button variant="ghost">Teacher Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Teacher Dashboard</h1>
        <p className="text-gray-600 mb-8">Manage your lessons and students</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Lessons</CardTitle>
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
              <CardTitle className="text-sm font-medium text-gray-500">Total Students</CardTitle>
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
              <CardTitle className="text-sm font-medium text-gray-500">Upcoming Lessons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.upcomingLessons || 0}</div>
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

        <Tabs defaultValue="lessons" className="space-y-6">
          <TabsList>
            <TabsTrigger value="lessons">My Lessons</TabsTrigger>
            <TabsTrigger value="students">My Students</TabsTrigger>
            <TabsTrigger value="create">Create Lesson</TabsTrigger>
          </TabsList>

          <TabsContent value="lessons">
            <div className="space-y-4">
              {lessons?.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No lessons created yet</p>
                    <Button className="mt-4" onClick={() => setShowCreateForm(true)}>Create First Lesson</Button>
                  </CardContent>
                </Card>
              ) : (
                lessons?.map((lesson: any) => (
                  <Card key={lesson.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-2">{lesson.title}</h3>
                          <p className="text-gray-600 mb-3">{lesson.description}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(lesson.dateTime).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <span>{lesson.registrations?.length || 0} / {lesson.maxStudents} students</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingLesson(lesson);
                              setFormData({
                                title: lesson.title,
                                description: lesson.description || '',
                                hobbyId: lesson.hobbyId.toString(),
                                dateTime: lesson.dateTime.slice(0, 16),
                                durationMinutes: lesson.durationMinutes.toString(),
                                maxStudents: lesson.maxStudents.toString(),
                                zoomLink: lesson.zoomLink || '',
                              });
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500"
                            onClick={() => {
                              if (confirm('Delete this lesson?')) {
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
          </TabsContent>

          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle>My Students</CardTitle>
                <CardDescription>Students registered in your lessons</CardDescription>
              </CardHeader>
              <CardContent>
                {students?.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No students yet</p>
                ) : (
                  <div className="space-y-3">
                    {students?.map((student: any) => (
                      <div key={student.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{student.profile?.firstName} {student.profile?.lastName}</p>
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
          </TabsContent>

          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>Create New Lesson</CardTitle>
                <CardDescription>Add a new lesson for students to join</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Lesson Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter a title (minimum 5 characters)"
                      value={formData.title}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                    {formData.title.length > 0 && formData.title.length < 5 && (
                      <p className="text-red-500 text-xs mt-1">Title must be at least 5 characters ({formData.title.length}/5)</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="hobbyId">Hobby Category</Label>
                    <select
                      id="hobbyId"
                      className="w-full border rounded-md px-3 py-2"
                      value={formData.hobbyId}
                      onChange={(e) => setFormData({ ...formData, hobbyId: e.target.value })}
                      required
                    >
                      <option value="">Select Hobby</option>
                      {hobbies?.map((hobby: any) => (
                        <option key={hobby.id} value={hobby.id}>{hobby.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="dateTime">Date & Time</Label>
                    <Input
                      id="dateTime"
                      type="datetime-local"
                      value={formData.dateTime}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, dateTime: e.target.value })}
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, durationMinutes: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxStudents">Max Students</Label>
                      <Input
                        id="maxStudents"
                        type="number"
                        value={formData.maxStudents}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, maxStudents: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="zoomLink">Zoom Link (optional)</Label>
                    <Input
                      id="zoomLink"
                      placeholder="https://zoom.us/j/..."
                      value={formData.zoomLink}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, zoomLink: e.target.value })}
                    />
                  </div>
                  <Button type="submit" disabled={createLessonMutation.isPending}>
                    {createLessonMutation.isPending ? 'Creating...' : 'Create Lesson'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {editingLesson && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-auto">
              <CardHeader>
                <CardTitle>Edit Lesson</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div>
                    <Label htmlFor="edit-title">Title</Label>
                    <Input
                      id="edit-title"
                      value={formData.title}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      value={formData.description}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-hobbyId">Hobby</Label>
                    <select
                      id="edit-hobbyId"
                      className="w-full border rounded-md px-3 py-2"
                      value={formData.hobbyId}
                      onChange={(e) => setFormData({ ...formData, hobbyId: e.target.value })}
                      required
                    >
                      <option value="">Select Hobby</option>
                      {hobbies?.map((hobby: any) => (
                        <option key={hobby.id} value={hobby.id}>{hobby.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="edit-dateTime">Date & Time</Label>
                    <Input
                      id="edit-dateTime"
                      type="datetime-local"
                      value={formData.dateTime}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, dateTime: e.target.value })}
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, durationMinutes: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-maxStudents">Max Students</Label>
                      <Input
                        id="edit-maxStudents"
                        type="number"
                        value={formData.maxStudents}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, maxStudents: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="edit-zoomLink">Zoom Link</Label>
                    <Input
                      id="edit-zoomLink"
                      value={formData.zoomLink}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, zoomLink: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" disabled={updateLessonMutation.isPending}>
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setEditingLesson(null)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}