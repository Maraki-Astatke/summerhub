'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth-provider';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import { CheckCircle, Loader2, ArrowLeft, ArrowRight, Send, ShieldX } from 'lucide-react';
import { toast, Toaster } from 'sonner';

export default function QuizPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: number; answer: string }[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState('');

  // Check if user is allowed to take quiz (only students)
  const isStudent = user?.roles?.[0] === 'student';
  const isTeacher = user?.roles?.[0] === 'teacher';
  const isAdmin = user?.roles?.[0] === 'admin';
  const isSeller = user?.roles?.[0] === 'seller';

  const { data: questions, isLoading: questionsLoading } = useQuery({
    queryKey: ['quiz-questions'],
    queryFn: async () => {
      const response = await api.get('/quiz/questions');
      return response.data;
    },
    enabled: !!user && isStudent, // Only fetch if user is student
  });

  const { data: existingResult } = useQuery({
    queryKey: ['quiz-results'],
    queryFn: async () => {
      try {
        const response = await api.get('/quiz/results');
        return response.data;
      } catch (error: any) {
        if (error.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!user && isStudent,
  });

  const submitMutation = useMutation({
    mutationFn: async (answers: { questionId: number; answer: string }[]) => {
      const response = await api.post('/quiz/submit', { answers });
      return response.data;
    },
    onSuccess: (data) => {
      setQuizCompleted(true);
      queryClient.invalidateQueries({ queryKey: ['quiz-results'] });
      toast.success('Quiz submitted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to submit quiz');
    },
  });

  useEffect(() => {
    if (existingResult && !quizCompleted) {
      setQuizCompleted(true);
    }
  }, [existingResult]);

  useEffect(() => {
    const existingAnswer = answers.find(a => a.questionId === questions?.[currentQuestionIndex]?.id);
    if (existingAnswer) {
      setCurrentAnswer(existingAnswer.answer);
    } else {
      setCurrentAnswer('');
    }
  }, [currentQuestionIndex, questions, answers]);

  const handleSaveAnswer = () => {
    const currentQuestion = questions?.[currentQuestionIndex];
    if (!currentQuestion) return;

    if (!currentAnswer.trim()) {
      toast.warning('Please write your answer before continuing');
      return;
    }

    const existingIndex = answers.findIndex(a => a.questionId === currentQuestion.id);
    if (existingIndex !== -1) {
      const newAnswers = [...answers];
      newAnswers[existingIndex] = { questionId: currentQuestion.id, answer: currentAnswer.trim() };
      setAnswers(newAnswers);
    } else {
      setAnswers([...answers, { questionId: currentQuestion.id, answer: currentAnswer.trim() }]);
    }

    toast.success('Answer saved');
  };

  const handleNext = () => {
    const currentQuestion = questions?.[currentQuestionIndex];
    if (!currentAnswer.trim()) {
      toast.warning('Please write your answer before continuing');
      return;
    }

    handleSaveAnswer();

    if (currentQuestionIndex < (questions?.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentAnswer.trim()) {
      handleSaveAnswer();
    }
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = () => {
    if (!currentAnswer.trim()) {
      toast.warning('Please answer the current question before submitting');
      return;
    }
    
    handleSaveAnswer();
    submitMutation.mutate(answers);
  };

  const isAnswerSaved = (questionId: number) => {
    return answers.some(a => a.questionId === questionId);
  };

  // Show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  // Redirect to login if not logged in
  if (!user) {
    router.push('/login');
    return null;
  }

  // Show forbidden message for non-students
  if (!isStudent) {
    let roleName = '';
    if (isTeacher) roleName = 'Teacher';
    else if (isAdmin) roleName = 'Admin';
    else if (isSeller) roleName = 'Seller';
    else roleName = user?.roles?.[0] || 'User';

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
        <Navbar alwaysWhite={true} />
        <main className="container mx-auto px-4 py-12 pt-32 max-w-2xl">
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center">
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <ShieldX className="h-10 w-10 text-red-600" />
              </div>
              <CardTitle className="text-2xl text-gray-800">Access Denied</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-2">
                This quiz is only available for <strong>Students</strong>.
              </p>
              <p className="text-gray-500 text-sm mb-6">
                Your role: <span className="font-semibold text-purple-600">{roleName}</span>
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/dashboard">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    Go to Dashboard
                  </Button>
                </Link>
                {isTeacher && (
                  <Link href="/teacher">
                    <Button variant="outline">Teacher Dashboard</Button>
                  </Link>
                )}
                {isAdmin && (
                  <Link href="/admin">
                    <Button variant="outline">Admin Dashboard</Button>
                  </Link>
                )}
                {isSeller && (
                  <Link href="/seller">
                    <Button variant="outline">Seller Dashboard</Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Show if no questions available
  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
        <Toaster position="top-center" richColors />
        <Navbar alwaysWhite={true} />
        <main className="container mx-auto px-4 py-12 pt-32 max-w-2xl">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">No Quiz Available</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6">
                No quiz questions have been added yet. Please check back later.
              </p>
              <Link href="/dashboard">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Go to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Show quiz completed state
  if (quizCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
        <Toaster position="top-center" richColors />
        <Navbar alwaysWhite={true} />
        <main className="container mx-auto px-4 py-12 pt-32 max-w-3xl">
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Quiz Submitted! 🎉</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Thank you for completing the assessment! Our experts will review your answers and provide personalized hobby recommendations within 2-3 business days.
                </p>
                <p className="text-sm text-gray-500">
                  You will receive a notification when recommendations are ready.
                </p>
              </div>
              <div className="flex gap-4 justify-center pt-4">
                <Link href="/hobbies">
                  <Button className="bg-purple-600 hover:bg-purple-700">Explore Hobbies</Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline">Go to Dashboard</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const currentQuestion = questions?.[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / (questions?.length || 1)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      <Toaster position="top-center" richColors />
      <Navbar alwaysWhite={true} />
      
      <main className="container mx-auto px-4 py-12 pt-32 max-w-3xl">
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Question {currentQuestionIndex + 1} of {questions?.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2 bg-gray-200" />
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 font-bold text-sm">{currentQuestionIndex + 1}</span>
              </div>
              <CardTitle className="text-xl text-gray-800 pt-1">{currentQuestion?.question}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Textarea
                placeholder="Write your answer here... Be as detailed as you like. This will help our experts understand your interests better."
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                rows={6}
                className="resize-none text-base rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-400"
              />
              <div className="flex justify-between mt-2">
                <p className="text-xs text-gray-400">
                  {currentAnswer.length} characters
                </p>
                {isAnswerSaved(currentQuestion?.id) && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Saved
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-between gap-4 pt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="rounded-xl"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              {currentQuestionIndex === questions?.length - 1 ? (
                <Button 
                  onClick={handleSubmitQuiz}
                  disabled={submitMutation.isPending || !currentAnswer.trim()}
                  className="bg-green-600 hover:bg-green-700 rounded-xl"
                >
                  {submitMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Quiz
                    </>
                  )}
                </Button>
              ) : (
                <Button 
                  onClick={handleNext}
                  disabled={!currentAnswer.trim()}
                  className="bg-purple-600 hover:bg-purple-700 rounded-xl"
                >
                  Save & Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>

            {/* Progress indicator */}
            <div className="pt-4 border-t">
              <div className="flex flex-wrap gap-2 justify-center">
                {questions?.map((q: any, idx: number) => (
                  <button
                    key={q.id}
                    onClick={() => {
                      if (currentAnswer.trim()) {
                        handleSaveAnswer();
                      }
                      setCurrentQuestionIndex(idx);
                    }}
                    className={`w-8 h-8 rounded-full text-xs font-medium transition-all ${
                      idx === currentQuestionIndex
                        ? 'bg-purple-600 text-white'
                        : isAnswerSaved(q.id)
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
              <p className="text-center text-xs text-gray-400 mt-3">
                {answers.length} of {questions?.length} questions answered
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}