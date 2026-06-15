'use client';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth-provider';
import api from '@/lib/api';
import { Calendar, User, Heart, MessageCircle, ArrowLeft, Edit, Trash2, ShieldX } from 'lucide-react';
import { useState } from 'react';

export default function BlogPostPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');

  // Check user role
  const isStudent = user?.roles?.[0] === 'student';
  const isAdmin = user?.roles?.[0] === 'admin';

  const { data: post, isLoading } = useQuery({
    queryKey: ['blog-post', id],
    queryFn: async () => {
      const response = await api.get(`/blog/posts/${id}`);
      return response.data;
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: async ({ title, content, imageUrl }: { title: string; content: string; imageUrl?: string }) => {
      const response = await api.put(`/blog/posts/${id}`, { title, content, imageUrl });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-post', id] });
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      setIsEditDialogOpen(false);
      alert('Post updated successfully!');
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Failed to update post');
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/blog/posts/${id}`);
    },
    onSuccess: () => {
      router.push('/blog');
      alert('Post deleted successfully!');
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Failed to delete post');
    },
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/blog/posts/${id}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-post', id] });
    },
  });

  const unlikeMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/blog/posts/${id}/unlike`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-post', id] });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await api.post(`/blog/posts/${id}/comments`, { content });
      return response.data;
    },
    onSuccess: () => {
      setComment('');
      queryClient.invalidateQueries({ queryKey: ['blog-post', id] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Failed to add comment');
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      await api.delete(`/blog/comments/${commentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-post', id] });
    },
  });

  const hasLiked = post?.likes?.some((like: any) => like.userId === user?.id);
  // Only author or admin can edit/delete
  const canEditDelete = user?.id === post?.authorId || isAdmin;
  // Only students can comment (optional - you can allow all roles to comment)
  const canComment = isStudent;

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim() || !editContent.trim()) {
      alert('Please fill in title and content');
      return;
    }
    updatePostMutation.mutate({ title: editTitle, content: editContent, imageUrl: editImageUrl || undefined });
  };

  const openEditDialog = () => {
    setEditTitle(post?.title || '');
    setEditContent(post?.content || '');
    setEditImageUrl(post?.imageUrl || '');
    setIsEditDialogOpen(true);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Post not found</p>
          <Link href="/blog">
            <Button className="mt-4">Back to Blog</Button>
          </Link>
        </div>
      </div>
    );
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
            {user ? (
              <Link href="/dashboard">
                <Button>Dashboard</Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button>Login</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/blog" className="inline-flex items-center text-gray-600 hover:text-purple-600 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blog
        </Link>

        <article className="bg-white rounded-lg shadow-sm overflow-hidden">
          {post.imageUrl && (
            <div className="relative h-96 w-full">
              <Image
                src={post.imageUrl}
                alt={post.title}
                fill
                className="object-cover"
              />
            </div>
          )}
          
          <div className="p-6 md:p-8">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl md:text-4xl font-bold flex-1">{post.title}</h1>
              {/* Only show Edit/Delete buttons for author or admin */}
              {canEditDelete && (
                <div className="flex gap-2 ml-4">
                  <Button variant="outline" size="sm" onClick={openEditDialog}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-500 hover:text-red-700"
                    onClick={() => {
                      if (confirm('Delete this post? This action cannot be undone.')) {
                        deletePostMutation.mutate();
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
              <span className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {post.author?.profile?.firstName} {post.author?.profile?.lastName}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="prose max-w-none mb-8">
              <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
            </div>

            {/* Like Button - All logged-in users can like */}
            <div className="flex items-center gap-6 border-t border-b py-4 mb-8">
              {user ? (
                hasLiked ? (
                  <Button variant="outline" onClick={() => unlikeMutation.mutate()}>
                    <Heart className="h-5 w-5 mr-2 fill-red-500 text-red-500" />
                    Liked ({post.likeCount || 0})
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => likeMutation.mutate()}>
                    <Heart className="h-5 w-5 mr-2" />
                    Like ({post.likeCount || 0})
                  </Button>
                )
              ) : (
                <Button variant="outline" asChild>
                  <Link href="/login">
                    <Heart className="h-5 w-5 mr-2" />
                    Like ({post.likeCount || 0})
                  </Link>
                </Button>
              )}
              <span className="flex items-center gap-2 text-gray-500">
                <MessageCircle className="h-5 w-5" />
                {post.comments?.length || 0} Comments
              </span>
            </div>

            {/* Comments Section - Only students can comment */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Comments</h3>
              
              {user ? (
                canComment ? (
                  <div className="mb-6">
                    <Textarea
                      placeholder="Write a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                      className="mb-2"
                    />
                    <Button 
                      onClick={() => commentMutation.mutate(comment)}
                      disabled={!comment.trim() || commentMutation.isPending}
                    >
                      Post Comment
                    </Button>
                  </div>
                ) : (
                  <Card className="mb-6 bg-yellow-50 border-yellow-200">
                    <CardContent className="text-center py-4">
                      <div className="flex items-center justify-center gap-2">
                        <ShieldX className="h-5 w-5 text-yellow-600" />
                        <p className="text-yellow-700">
                          Only students can post comments. Your role does not have permission to comment.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )
              ) : (
                <Card className="mb-6">
                  <CardContent className="text-center py-4">
                    <p className="text-gray-500">
                      <Link href="/login" className="text-purple-600">Login</Link> to leave a comment
                    </p>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4">
                {post.comments?.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No comments yet. Be the first!</p>
                ) : (
                  post.comments?.map((comment: any) => (
                    <Card key={comment.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold">
                                {comment.user?.profile?.firstName} {comment.user?.profile?.lastName}
                              </span>
                              <span className="text-xs text-gray-400">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-700">{comment.content}</p>
                          </div>
                          {/* Allow comment author, post author, or admin to delete comments */}
                          {(user?.id === comment.userId || user?.id === post.authorId || isAdmin) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500"
                              onClick={() => deleteCommentMutation.mutate(comment.id)}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </article>
      </main>

      {/* Edit Dialog - Only shown for author/admin */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-imageUrl">Image URL (optional)</Label>
              <Input
                id="edit-imageUrl"
                placeholder="https://example.com/image.jpg"
                value={editImageUrl}
                onChange={(e) => setEditImageUrl(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={10}
                required
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={updatePostMutation.isPending}>
                Save Changes
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}