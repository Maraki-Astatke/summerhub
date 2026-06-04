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
import api from '../../lib/api';
import { ArrowLeft, ImageIcon } from 'lucide-react';

export default function CreateBlogPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const createPostMutation = useMutation({
    mutationFn: async (data: { title: string; content: string; imageUrl?: string }) => {
      const response = await api.post('/blog/posts', data);
      return response.data;
    },
    onSuccess: (post) => {
      router.push(`/blog/${post.id}`);
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Failed to create post');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('Please fill in title and content');
      return;
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-purple-600">HobbyHub</Link>
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
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter post title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
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
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Write your post content here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={12}
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={createPostMutation.isPending}>
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