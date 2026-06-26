'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth-provider';
import api from '@/lib/api';
import { 
  ArrowLeft, 
  Send, 
  CheckCircle, 
  Loader2,
  User,
  Mail,
  Calendar,
  FileText,
  Award,
  BookOpen
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

export default function StudentQuizDetailPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id;
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [selectedHobby, setSelectedHobby] = useState('');
  const [recommendReason, setRecommendReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: student, isLoading, refetch, error } = useQuery({
    queryKey: ['admin-quiz-student', studentId],
    queryFn: async () => {
      const response = await api.get(`/admin/quiz-responses/student/${studentId}`);
      console.log('API Response for student:', response.data);
      return response.data;
    },
    enabled: !!user && user?.roles?.includes('admin') && !!studentId,
  });

  const { data: hobbies } = useQuery({
    queryKey: ['admin-hobbies-list'],
    queryFn: async () => {
      const response = await api.get('/admin/hobbies-list');
      return response.data;
    },
    enabled: !!user && user?.roles?.includes('admin'),
  });

  const recommendMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/admin/quiz-responses/${studentId}/recommend`, {
        hobbyId: parseInt(selectedHobby),
        reason: recommendReason
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-quiz-student', studentId] });
      queryClient.invalidateQueries({ queryKey: ['admin-quiz-summary'] });
      queryClient.invalidateQueries({ queryKey: ['admin-quiz-responses'] });
      setSelectedHobby('');
      setRecommendReason('');
      toast.success('Recommendation sent successfully!', {
        description: 'The student will see this recommendation in their dashboard.',
      });
      refetch();
    },
    onError: (error: any) => {
      toast.error('Failed to send recommendation', {
        description: error.response?.data?.error || 'Please try again',
      });
    },
  });

  const handleSendRecommendation = () => {
    if (!selectedHobby) {
      toast.error('Please select a hobby', {
        description: 'You must choose a hobby to recommend.',
      });
      return;
    }
    
    setIsSubmitting(true);
    recommendMutation.mutate();
    setIsSubmitting(false);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF7A45]" />
      </div>
    );
  }

  if (!user || !user?.roles?.includes('admin')) {
    router.push('/');
    return null;
  }

  if (error) {
    console.error('Error fetching student:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <p className="text-red-500">Error loading student data</p>
            <p className="text-sm text-gray-400 mt-2">Please check if the student exists</p>
            <Button className="mt-4" onClick={() => router.push('/admin/quiz-responses')}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!student || !student.id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <p className="text-gray-500">Student not found</p>
            <p className="text-sm text-gray-400 mt-2">The student you're looking for doesn't exist or hasn't taken the quiz yet.</p>
            <Button className="mt-4" onClick={() => router.push('/admin/quiz-responses')}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasTakenQuiz = student.hasTakenQuiz === true;
  const quizAnswers = student.quizAnswers || [];
  const recommendations = student.recommendations || [];
  const totalAnswers = student.totalAnswers || 0;
  const totalRecommendations = student.totalRecommendations || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" richColors />
      
      {}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/admin" className="text-xl font-bold text-[#FF7A45]">
            HobbyHub Admin
          </Link>
          <Link href="/admin/quiz-responses">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Responses
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {}
        <Card className="mb-6 border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#FF7A45]/10 flex items-center justify-center">
                <User className="h-6 w-6 text-[#FF7A45]" />
              </div>
              <div>
                <CardTitle className="text-2xl">
                  {student.profile?.firstName || 'Unknown'} {student.profile?.lastName || ''}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Mail className="h-3 w-3" />
                  {student.email || 'No email'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Questions:</span>
                <span className="font-semibold">{totalAnswers}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Award className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Recommendations:</span>
                <span className="font-semibold">{totalRecommendations}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Quiz Taken:</span>
                <span className="font-semibold">
                  {hasTakenQuiz ? 'Yes' : 'Not yet'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {}
        <Card className="mb-6 border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Student's Answers</CardTitle>
            <CardDescription>Review the student's written responses to each question</CardDescription>
          </CardHeader>
          <CardContent>
            {!hasTakenQuiz ? (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>This student has not taken the quiz yet</p>
                <p className="text-sm mt-1">Once they complete the quiz, their answers will appear here</p>
              </div>
            ) : quizAnswers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No quiz answers submitted yet</p>
              </div>
            ) : (
              <div className="space-y-6">
                {quizAnswers.map((answer: any, idx: number) => (
                  <div key={answer.id || idx} className="p-5 border rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-[#FF7A45]/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-[#FF7A45] font-bold text-sm">{idx + 1}</span>
                      </div>
                      <h3 className="font-semibold text-gray-800 text-lg">
                        {answer.questionText || `Question ${idx + 1}`}
                      </h3>
                    </div>
                    
                    <div className="ml-11 pl-4 border-l-4 border-[#FF7A45]/20">
                      <div className="bg-[#FFF2EB] rounded-lg p-4">
                        <p className="text-sm text-gray-500 mb-1">Student's Response:</p>
                        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                          {answer.answerText || 'No answer provided'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {}
        {recommendations.length > 0 && (
          <Card className="mb-6 border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Previous Recommendations</CardTitle>
              <CardDescription>Hobbies already recommended to this student</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendations.map((rec: any, idx: number) => (
                  <div key={rec.id || idx} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-semibold text-gray-800">{rec.hobby?.name || 'Unknown Hobby'}</span>
                      <Badge variant="outline" className="ml-auto text-xs">
                        {rec.createdAt ? new Date(rec.createdAt).toLocaleDateString() : 'Unknown date'}
                      </Badge>
                    </div>
                    {rec.reason && (
                      <p className="text-sm text-gray-600 mt-1 pl-6 italic">"{rec.reason}"</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2 pl-6">
                      Recommended by: {rec.admin?.profile?.firstName || 'Admin'} {rec.admin?.profile?.lastName || ''}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {}
        {hasTakenQuiz ? (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Recommend a Hobby</CardTitle>
              <CardDescription>
                Based on the student's answers above, select a hobby and add a personalized message
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Select Hobby *
                  </label>
                  <Select value={selectedHobby} onValueChange={setSelectedHobby}>
                    <SelectTrigger className="rounded-xl border-gray-200">
                      <SelectValue placeholder="Choose a hobby to recommend" />
                    </SelectTrigger>
                    <SelectContent>
                      {hobbies?.map((hobby: any) => (
                        <SelectItem key={hobby.id} value={hobby.id.toString()}>
                          {hobby.name} - {hobby.category?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Recommendation Message (Optional)
                  </label>
                  <Textarea
                    placeholder="Explain why this hobby would be good for the student. For example: 'Based on your interest in creative activities, I think you would enjoy Digital Art!'"
                    value={recommendReason}
                    onChange={(e) => setRecommendReason(e.target.value)}
                    rows={4}
                    className="rounded-xl border-gray-200 resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {recommendReason.length}/500 characters
                  </p>
                </div>

                <Button 
                  onClick={handleSendRecommendation}
                  disabled={!selectedHobby || isSubmitting}
                  className="w-full bg-[#FF7A45] hover:bg-[#ff8f61] rounded-xl h-11"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Recommendation
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-sm bg-yellow-50">
            <CardContent className="text-center py-8">
              <p className="text-yellow-700">Student hasn't taken the quiz yet</p>
              <p className="text-sm text-yellow-600 mt-1">
                Recommendations can only be given after the student completes the quiz.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
