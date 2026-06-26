'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/providers/auth-provider';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { ArrowLeft, ImageIcon, ShieldX } from 'lucide-react';

export default function CreateBlogPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [titleError, setTitleError] = useState('');
  const [contentError, setContentError] = useState('');

  const isStudent = user?.roles?.[0] === 'student';
  const isTeacher = user?.roles?.[0] === 'teacher';
  const isAdmin = user?.roles?.[0] === 'admin';
  const isSeller = user?.roles?.[0] === 'seller';

  const createPostMutation = useMutation({
    mutationFn: async (data: { title: string; content: string; imageUrl?: string }) => {
      const response = await api.post('/blog/posts', data);
      return response.data;
    },
    onSuccess: (post) => {
      router.push(`/blog/${post.id}`);
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.errors?.[0]?.msg || error.response?.data?.error || 'Failed to create post';
      alert(errorMsg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    setTitleError('');
    setContentError('');
    
    let hasError = false;
    
    if (!title.trim()) {
      setTitleError('Title is required');
      hasError = true;
    } else if (title.trim().length < 5) {
      setTitleError('Title must be at least 5 characters');
      hasError = true;
    }
    
    if (!content.trim()) {
      setContentError('Content is required');
      hasError = true;
    } else if (content.trim().length < 20) {
      setContentError('Content must be at least 20 characters');
      hasError = true;
    }
    
    if (hasError) return;
    
    createPostMutation.mutate({ title, content, imageUrl: imageUrl || undefined });
  };

  if (authLoading) {
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

  if (!isStudent) {
    let roleName = '';
    if (isTeacher) roleName = 'Teacher';
    else if (isAdmin) roleName = 'Admin';
    else if (isSeller) roleName = 'Seller';
    else roleName = user?.roles?.[0] || 'User';

    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/" className="text-xl font-bold text-[#FF7A45]">HobbyHub</Link>
            <div className="flex gap-4">
              <Link href="/blog">
                <Button variant="ghost">Blog</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12 max-w-2xl">
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center">
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <ShieldX className="h-10 w-10 text-red-600" />
              </div>
              <CardTitle className="text-2xl text-gray-800">Access Denied</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-2">
                Only <strong>Students</strong> can create blog posts.
              </p>
              <p className="text-gray-500 text-sm mb-6">
                Your role: <span className="font-semibold text-[#FF7A45]">{roleName}</span>
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/blog">
                  <Button className="bg-[#FF7A45] hover:bg-[#ff8f61]">
                    Back to Blog
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

  return (
    <div className="min-h-screen bg-gray-50 text-[#1F2937]">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-[#FF7A45]">HobbyHub</Link>
          <div className="flex gap-4">
            <Link href="/blog">
              <Button variant="ghost">Blog</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/blog">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Create New Post</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Write Your Story</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Title (minimum 5 characters)</Label>
                <Input
                  id="title"
                  placeholder="Enter post title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className={titleError ? 'border-red-500' : ''}
                />
                {titleError && (
                  <p className="text-red-500 text-sm mt-1">{titleError}</p>
                )}
                {!titleError && title.length > 0 && title.length < 5 && (
                  <p className="text-orange-500 text-sm mt-1">{title.length}/5 characters minimum</p>
                )}
              </div>

              <div>
                <Label htmlFor="imageUrl">Featured Image URL (optional)</Label>
                <div className="flex gap-2">
                  <Input
                    id="imageUrl"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                  {imageUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setImageUrl('')}
                    >
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">Add a cover image URL to make your post stand out</p>
              </div>

              <div>
                <Label htmlFor="content">Content (minimum 20 characters)</Label>
                <Textarea
                  id="content"
                  placeholder="Write your post content here... (minimum 20 characters)"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={12}
                  required
                  className={contentError ? 'border-red-500' : ''}
                />
                {contentError && (
                  <p className="text-red-500 text-sm mt-1">{contentError}</p>
                )}
                {!contentError && content.length > 0 && content.length < 20 && (
                  <p className="text-orange-500 text-sm mt-1">{content.length}/20 characters minimum</p>
                )}
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={createPostMutation.isPending} className="bg-[#FF7A45] hover:bg-[#ff8f61] text-[#1F2937]">
                  {createPostMutation.isPending ? 'Publishing...' : 'Publish Post'}
                </Button>
                <Link href="/blog">
                  <Button type="button" variant="outline">Cancel</Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
