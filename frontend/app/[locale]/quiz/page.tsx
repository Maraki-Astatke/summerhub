'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth-provider';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import { CheckCircle, Circle } from 'lucide-react';

export default function QuizPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: number; selectedHobbyId: number }[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [results, setResults] = useState<any>(null);

  const { data: questions, isLoading: questionsLoading } = useQuery({
    queryKey: ['quiz-questions'],
    queryFn: async () => {
      const response = await api.get('/quiz/questions');
      return response;
    },
    enabled: !!user,
  });

  const { data: existingResult } = useQuery({
    queryKey: ['quiz-results'],
    queryFn: async () => {
      const response = await api.get('/quiz/results');
      return response.data;
    },
    enabled: !!user,
  });

  const submitMutation = useMutation({
    mutationFn: async (answers: { questionId: number; selectedHobbyId: number }[]) => {
      const response = await api.post('/quiz/submit', { answers });
      return response.data;
    },
    onSuccess: (data) => {
      setResults(data);
      setQuizCompleted(true);
      queryClient.invalidateQueries({ queryKey: ['quiz-results'] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Failed to submit quiz');
    },
  });

  useEffect(() => {
    if (existingResult && !quizCompleted) {
      setQuizCompleted(true);
      setResults(existingResult);
    }
  }, [existingResult]);

  const handleAnswer = (questionId: number, selectedHobbyId: number) => {
    const existingIndex = answers.findIndex(a => a.questionId === questionId);
    if (existingIndex !== -1) {
      const newAnswers = [...answers];
      newAnswers[existingIndex] = { questionId, selectedHobbyId };
      setAnswers(newAnswers);
    } else {
      setAnswers([...answers, { questionId, selectedHobbyId }]);
    }
  };

  const handleNext = () => {
    const currentQuestion = questions?.data?.[currentQuestionIndex];
    const hasAnswered = answers.some(a => a.questionId === currentQuestion?.id);
    
    if (!hasAnswered) {
      alert('Please select an answer before continuing');
      return;
    }
    
    if (currentQuestionIndex < questions?.data?.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      submitMutation.mutate(answers);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  if (authLoading || questionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  if (quizCompleted && results) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar alwaysWhite={true} />
        <main className="container mx-auto px-4 py-12 pt-32 max-w-3xl">
          <Card>
            <CardHeader className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <CardTitle className="text-2xl">Quiz Completed!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-gray-600 mb-4">Based on your answers, we recommend:</p>
                <div className="space-y-3">
                  {results.recommendations?.map((hobby: any, idx: number) => (
                    <div key={idx} className="p-4 border rounded-lg bg-purple-50">
                      <h3 className="font-bold text-lg">{hobby.name}</h3>
                      <p className="text-gray-600 text-sm">{hobby.description}</p>
                      <p className="text-xs text-purple-600 mt-1">{hobby.category?.name}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-4 justify-center pt-4">
                <Link href="/hobbies">
                  <Button>Explore Hobbies</Button>
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

  const currentQuestion = questions?.data?.[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / (questions?.data?.length || 1)) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar alwaysWhite={true} />
      
      <main className="container mx-auto px-4 py-12 pt-32 max-w-2xl">
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Question {currentQuestionIndex + 1} of {questions?.data?.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{currentQuestion?.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {currentQuestion?.options?.map((option: any, idx: number) => {
                const isSelected = answers.some(
                  a => a.questionId === currentQuestion.id && a.selectedHobbyId === option.hobbyId
                );
                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(currentQuestion.id, option.hobbyId)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isSelected ? (
                        <CheckCircle className="h-5 w-5 text-purple-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400" />
                      )}
                      <span>{option.text}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between gap-4 pt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>
              <Button onClick={handleNext}>
                {currentQuestionIndex === questions?.data?.length - 1 ? 'Submit' : 'Next'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}