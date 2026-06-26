'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/providers/auth-provider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { User, Mail, Phone, MapPin, School, Calendar, Save, GraduationCap, Briefcase, Building2, Shield } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    grade: '',
    city: '',
    schoolName: '',
    bio: '',
    profession: '',
    company: '',
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' || 'light';
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await api.get('/profile');
      return response.data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (profile?.profile) {
      setFormData({
        firstName: profile.profile.firstName || '',
        lastName: profile.profile.lastName || '',
        age: profile.profile.age || '',
        grade: profile.profile.grade || '',
        city: profile.profile.city || '',
        schoolName: profile.profile.schoolName || '',
        bio: profile.profile.bio || '',
        profession: profile.profile.profession || '',
        company: profile.profile.company || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.put('/profile', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setIsEditing(false);
      alert('Profile updated successfully!');
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Failed to update profile');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      firstName: formData.firstName || null,
      lastName: formData.lastName || null,
      age: formData.age === '' ? null : parseInt(formData.age),
      grade: formData.grade === '' ? null : formData.grade,
      city: formData.city === '' ? null : formData.city,
      schoolName: formData.schoolName === '' ? null : formData.schoolName,
      bio: formData.bio === '' ? null : formData.bio,
      profession: formData.profession === '' ? null : formData.profession,
      company: formData.company === '' ? null : formData.company,
    };
    
    updateProfileMutation.mutate(submitData);
  };

  const userRole = user?.roles?.[0] || 'student';
  const isStudent = userRole === 'student';
  const isTeacher = userRole === 'teacher';
  const isSeller = userRole === 'seller';
  const isAdmin = userRole === 'admin';
  const isParent = userRole === 'parent';

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-[#FF7A45]">HobbyHub</Link>
          <div className="flex gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-gray-600 dark:text-gray-300 hover:text-[#FF7A45]">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">My Profile</h1>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} className="bg-[#FF7A45] hover:bg-[#ff8f61]">
              Edit Profile
            </Button>
          )}
        </div>

        <Tabs defaultValue="info" className="space-y-6">
          <TabsList className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            <TabsTrigger value="info" className="rounded-lg dark:data-[state=active]:bg-gray-700">
              Personal Information
            </TabsTrigger>
            <TabsTrigger value="account" className="rounded-lg dark:data-[state=active]:bg-gray-700">
              Account Settings
            </TabsTrigger>
          </TabsList>

          {}
          <TabsContent value="info">
            <Card className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800 dark:text-white">Personal Information</CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">
                  Update your personal details
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName" className="text-gray-700 dark:text-gray-300">First Name</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName" className="text-gray-700 dark:text-gray-300">Last Name</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className="dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {}
                      {isStudent && (
                        <div>
                          <Label htmlFor="age" className="text-gray-700 dark:text-gray-300">Age</Label>
                          <Input
                            id="age"
                            type="number"
                            value={formData.age}
                            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                            className="dark:bg-gray-700 dark:border-gray-600"
                          />
                        </div>
                      )}
                      
                      {}
                      {isStudent && (
                        <div>
                          <Label htmlFor="grade" className="text-gray-700 dark:text-gray-300">Grade</Label>
                          <Input
                            id="grade"
                            value={formData.grade}
                            onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                            className="dark:bg-gray-700 dark:border-gray-600"
                          />
                        </div>
                      )}
                      
                      {}
                      {isTeacher && (
                        <div>
                          <Label htmlFor="profession" className="text-gray-700 dark:text-gray-300">Profession</Label>
                          <Input
                            id="profession"
                            value={formData.profession}
                            onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                            placeholder="e.g., Music Teacher"
                            className="dark:bg-gray-700 dark:border-gray-600"
                          />
                        </div>
                      )}
                    </div>

                    {}
                    {isStudent && (
                      <div>
                        <Label htmlFor="schoolName" className="text-gray-700 dark:text-gray-300">School Name</Label>
                        <Input
                          id="schoolName"
                          value={formData.schoolName}
                          onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                          className="dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                    )}

                    {}
                    {(isTeacher || isSeller) && (
                      <div>
                        <Label htmlFor="company" className="text-gray-700 dark:text-gray-300">Organization/Company</Label>
                        <Input
                          id="company"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          placeholder={isTeacher ? "e.g., Music School" : "e.g., Art Supplies Inc."}
                          className="dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                    )}

                    {}
                    <div>
                      <Label htmlFor="city" className="text-gray-700 dark:text-gray-300">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>

                    {}
                    <div>
                      <Label htmlFor="bio" className="text-gray-700 dark:text-gray-300">Bio</Label>
                      <Input
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Tell us a little about yourself..."
                        className="dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button type="submit" disabled={updateProfileMutation.isPending} className="bg-[#FF7A45] hover:bg-[#ff8f61]">
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      {}
                      <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
                          <p className="font-medium text-gray-800 dark:text-white">
                            {profile?.profile?.firstName} {profile?.profile?.lastName}
                          </p>
                        </div>
                      </div>
                      
                      {}
                      <div className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                          <p className="font-medium text-gray-800 dark:text-white">{profile?.email}</p>
                        </div>
                      </div>
                      
                      {}
                      <div className="flex items-center gap-2">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                          <p className="font-medium text-gray-800 dark:text-white">{profile?.phone || 'Not provided'}</p>
                        </div>
                      </div>

                      {}
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
                          <p className="font-medium text-gray-800 dark:text-white capitalize">{userRole}</p>
                        </div>
                      </div>
                      
                      {}
                      {isStudent && profile?.profile?.grade && (
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Grade</p>
                            <p className="font-medium text-gray-800 dark:text-white">{profile.profile.grade}</p>
                          </div>
                        </div>
                      )}
                      
                      {}
                      {isTeacher && profile?.profile?.profession && (
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Profession</p>
                            <p className="font-medium text-gray-800 dark:text-white">{profile.profile.profession}</p>
                          </div>
                        </div>
                      )}
                      
                      {}
                      {(isTeacher || isSeller) && profile?.profile?.company && (
                        <div className="flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Organization</p>
                            <p className="font-medium text-gray-800 dark:text-white">{profile.profile.company}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {}
                    {isStudent && profile?.profile?.age && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Age</p>
                          <p className="font-medium text-gray-800 dark:text-white">{profile.profile.age}</p>
                        </div>
                      </div>
                    )}
                    
                    {}
                    {isStudent && profile?.profile?.schoolName && (
                      <div className="flex items-center gap-2">
                        <School className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">School</p>
                          <p className="font-medium text-gray-800 dark:text-white">{profile.profile.schoolName}</p>
                        </div>
                      </div>
                    )}
                    
                    {}
                    {profile?.profile?.city && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                          <p className="font-medium text-gray-800 dark:text-white">{profile.profile.city}</p>
                        </div>
                      </div>
                    )}
                    
                    {}
                    {profile?.profile?.bio && (
                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">About Me</p>
                        <p className="text-gray-700 dark:text-gray-300">{profile.profile.bio}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {}
          <TabsContent value="account">
            <Card className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800 dark:text-white">Account Settings</CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">
                  Manage your account preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">Email Verification</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {profile?.isVerified ? '✓ Verified' : 'Not verified'}
                    </p>
                  </div>
                  {!profile?.isVerified && (
                    <Button variant="outline" size="sm">Resend Verification</Button>
                  )}
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">Account Status</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {profile?.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-center py-3">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">Delete Account</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <Button variant="destructive" size="sm">Delete Account</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
