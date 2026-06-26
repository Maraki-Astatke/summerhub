'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth-provider';
import api from '@/lib/api';
import { Plus, Edit, Trash2, X, Menu } from 'lucide-react';

interface Option {
  text: string;
  hobbyId: number;
}

export default function AdminQuizPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<Option[]>([
    { text: '', hobbyId: 0 },
    { text: '', hobbyId: 0 }
  ]);
  const [hobbies, setHobbies] = useState<any[]>([]);

  const { data: questions, isLoading } = useQuery({
    queryKey: ['quiz-questions'],
    queryFn: async () => {
      const response = await api.get('/quiz/questions');
      return response.data;
    },
    enabled: !!user && user?.roles?.includes('admin'),
  });

  const { data: hobbiesList } = useQuery({
    queryKey: ['hobbies-list'],
    queryFn: async () => {
      const response = await api.get('/hobbies?limit=100');
      return response.data.data;
    },
    enabled: !!user && user?.roles?.includes('admin'),
  });

  const createMutation = useMutation({
    mutationFn: async (data: { question: string; options: Option[] }) => {
      const response = await api.post('/admin/quiz/questions', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-questions'] });
      setIsDialogOpen(false);
      resetForm();
      alert('Question created successfully!');
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Failed to create question');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { question: string; options: Option[] } }) => {
      const response = await api.put(`/admin/quiz/questions/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-questions'] });
      setIsDialogOpen(false);
      setEditingQuestion(null);
      resetForm();
      alert('Question updated successfully!');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/quiz/questions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-questions'] });
      alert('Question deleted');
    },
  });

  const resetForm = () => {
    setQuestion('');
    setOptions([
      { text: '', hobbyId: 0 },
      { text: '', hobbyId: 0 }
    ]);
  };

  const addOption = () => {
    setOptions([...options, { text: '', hobbyId: 0 }]);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) {
      alert('Minimum 2 options required');
      return;
    }
    setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, field: keyof Option, value: string | number) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) {
      alert('Question is required');
      return;
    }
    
    const validOptions = options.filter(opt => opt.text.trim() && opt.hobbyId > 0);
    if (validOptions.length < 2) {
      alert('At least 2 valid options required');
      return;
    }
    
    const data = {
      question: question.trim(),
      options: validOptions.map(opt => ({
        text: opt.text.trim(),
        hobbyId: opt.hobbyId
      }))
    };
    
    if (editingQuestion) {
      updateMutation.mutate({ id: editingQuestion.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const openEditDialog = (q: any) => {
    setEditingQuestion(q);
    setQuestion(q.question);
    setOptions(q.options || []);
    setIsDialogOpen(true);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!user || !user?.roles?.includes('admin')) {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link href="/admin" className="text-xl font-bold text-[#FF7A45]">Admin Panel</Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Quiz Management</h1>
            <p className="text-gray-500">Create and manage quiz questions for students</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setEditingQuestion(null); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>{editingQuestion ? 'Edit Question' : 'Add Question'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="question">Question</Label>
                  <Input
                    id="question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="e.g., What do you enjoy doing in your free time?"
                    required
                  />
                </div>
                
                <div>
                  <Label>Options (each option links to a hobby)</Label>
                  <div className="space-y-3 mt-2">
                    {options.map((opt, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <Input
                          placeholder="Option text"
                          value={opt.text}
                          onChange={(e) => updateOption(idx, 'text', e.target.value)}
                          className="flex-1"
                        />
                        <select
                          className="border rounded-md px-3 py-2 w-40"
                          value={opt.hobbyId}
                          onChange={(e) => updateOption(idx, 'hobbyId', parseInt(e.target.value))}
                        >
                          <option value={0}>Select Hobby</option>
                          {hobbiesList?.map((hobby: any) => (
                            <option key={hobby.id} value={hobby.id}>{hobby.name}</option>
                          ))}
                        </select>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOption(idx)}
                          className="text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addOption} className="mt-2">
                    <Plus className="h-3 w-3 mr-1" />
                    Add Option
                  </Button>
                </div>
                
                <Button type="submit" className="w-full">
                  {editingQuestion ? 'Update' : 'Create'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading...</div>
        ) : questions?.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500">No quiz questions yet</p>
              <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>Create First Question</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {questions?.map((q: any, idx: number) => (
              <Card key={q.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">Question {idx + 1}: {q.question}</CardTitle>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(q)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500"
                        onClick={() => {
                          if (confirm('Delete this question?')) {
                            deleteMutation.mutate(q.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {q.options?.map((opt: any, optIdx: number) => (
                      <div key={optIdx} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                        <span>{opt.text}</span>
                        <span className="text-xs text-[#FF7A45]">
                          {hobbiesList?.find((h: any) => h.id === opt.hobbyId)?.name || `Hobby ID: ${opt.hobbyId}`}
                        </span>
                      </div>
                    ))}
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
