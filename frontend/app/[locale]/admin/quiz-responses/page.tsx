'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth-provider';
import api from '@/lib/api';
import { 
  Users, 
  Eye, 
  Calendar, 
  Search, 
  Loader2, 
  FileText,
  CheckCircle,
  XCircle,
  Award,
  UserCheck
} from 'lucide-react';

export default function AdminQuizResponsesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: students, isLoading, error } = useQuery({
    queryKey: ['admin-quiz-responses'],
    queryFn: async () => {
      const response = await api.get('/admin/quiz-responses');
      console.log('API returned:', response.data);
      return response.data;
    },
    enabled: !!user && user?.roles?.includes('admin'),
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!user || !user?.roles?.includes('admin')) {
    router.push('/');
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <Link href="/admin" className="text-xl font-bold text-purple-600">HobbyHub Admin</Link>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-red-500">Error loading students</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const studentsArray = students || [];
  const filteredStudents = studentsArray.filter((student: any) => {
    const name = `${student.profile?.firstName || ''} ${student.profile?.lastName || ''}`.toLowerCase();
    const email = (student.email || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    return name.includes(search) || email.includes(search);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/admin" className="text-xl font-bold text-purple-600">
            HobbyHub Admin
          </Link>
          <div className="flex gap-4">
            <Link href="/admin">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Link href="/admin/quiz">
              <Button variant="ghost">Quiz Management</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Student Quiz Responses</h1>
          <p className="text-gray-500 mt-1">Review student answers and provide personalized recommendations</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-xl border-gray-200"
            />
          </div>
        </div>

        {/* Students List */}
        {filteredStudents.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No students found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student: any) => (
              <Card 
                key={student.id} 
                className="border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => router.push(`/admin/quiz-responses/${student.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <UserCheck className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {student.profile?.firstName || 'Unknown'} {student.profile?.lastName || ''}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {student.email || 'No email'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-500">
                        <FileText className="h-4 w-4" />
                        <span>Questions</span>
                      </div>
                      <Badge variant="secondary" className="rounded-full">
                        {student.totalAnswers || 0}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Award className="h-4 w-4" />
                        <span>Recommendations</span>
                      </div>
                      <Badge className="rounded-full">
                        {student.recommendationsCount || 0}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>Quiz Status</span>
                      </div>
                      <Badge 
                        className={`rounded-full ${student.hasTakenQuiz ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
                      >
                        {student.hasTakenQuiz ? 'Completed' : 'Not Started'}
                      </Badge>
                    </div>

                    <Button 
                      variant="outline" 
                      className="w-full mt-2 border-purple-200 text-purple-600 hover:bg-purple-50 rounded-xl"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/admin/quiz-responses/${student.id}`);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}