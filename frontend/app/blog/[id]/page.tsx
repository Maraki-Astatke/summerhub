'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth-provider';
import Navbar from '@/components/Navbar';
import api from '../../lib/api';        
import { Calendar, User, Heart, MessageCircle, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

export default function BlogPostPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');

  const { data: post, isLoading } = useQuery({
    queryKey: ['blog-post', id],
    queryFn: async () => {
      const response = await api.get(`/blog/posts/${id}`);
      return response.data;
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center font-semibold text-gray-500">Loading article...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center max-w-sm px-6 py-8 bg-white rounded-[24px] shadow-sm border border-gray-100">
          <p className="text-gray-500 font-medium mb-4">Post not found</p>
          <Link href="/blog">
            <Button className="bg-[#FF7A45] hover:bg-[#ff8f61] rounded-xl text-white font-bold h-11 px-6">
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1F2937]">
      <Navbar alwaysWhite={true} />

      <main className="max-w-4xl mx-auto px-4 py-12 pt-32">
        <Link href="/blog" className="inline-flex items-center text-sm font-semibold text-[#6B7280] hover:text-[#FF7A45] mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Insights
        </Link>

        {/* Post Content */}
        <article className="bg-white rounded-[24px] border border-gray-100 overflow-hidden shadow-sm">
          {post.imageUrl ? (
            <div className="relative h-96 w-full bg-gray-100">
              <Image
                src={post.imageUrl}
                alt={post.title}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="h-44 w-full bg-[#FFF2EB] flex items-center justify-center text-5xl font-extrabold text-[#FF7A45]">
              G
            </div>
          )}
          
          <div className="p-6 md:p-10">
            <h1 className="text-2xl md:text-3xl lg:text-[40px] font-extrabold tracking-tight text-[#1F2937] leading-tight mb-4">
              {post.title}
            </h1>
            
            <div className="flex items-center gap-6 text-xs md:text-sm font-semibold text-[#6B7280] mb-8 pb-6 border-b border-gray-100">
              <span className="flex items-center gap-2">
                <User className="h-4.5 w-4.5 text-[#FF7A45]" />
                {post.author?.profile?.firstName} {post.author?.profile?.lastName}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="h-4.5 w-4.5 text-[#FF7A45]" />
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="prose max-w-none mb-10">
              <p className="text-[#1F2937]/90 text-base md:text-lg leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>
            </div>

            {/* Like and Stats Section */}
            <div className="flex items-center gap-6 py-5 border-t border-b border-gray-100 mb-10">
              {user ? (
                hasLiked ? (
                  <Button 
                    variant="outline" 
                    onClick={() => unlikeMutation.mutate()}
                    className="rounded-xl border-[#FF7A45]/30 text-[#FF7A45] hover:bg-[#FFF2EB] font-semibold h-11"
                  >
                    <Heart className="h-5 w-5 mr-2 fill-red-500 text-red-500" />
                    Liked ({post.likeCount || 0})
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    onClick={() => likeMutation.mutate()}
                    className="rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold h-11"
                  >
                    <Heart className="h-5 w-5 mr-2 text-gray-500" />
                    Like ({post.likeCount || 0})
                  </Button>
                )
              ) : (
                <Button variant="outline" asChild className="rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold h-11">
                  <Link href="/login">
                    <Heart className="h-5 w-5 mr-2 text-gray-500" />
                    Like ({post.likeCount || 0})
                  </Link>
                </Button>
              )}
              <span className="flex items-center gap-2 text-sm font-semibold text-[#6B7280]">
                <MessageCircle className="h-5 w-5 text-[#FF7A45]" />
                {post.comments?.length || 0} Comments
              </span>
            </div>

            {/* Comments Section */}
            <div>
              <h3 className="text-xl font-bold text-[#1F2937] mb-6">Comments</h3>
              
              {/* Add Comment */}
              {user ? (
                <div className="mb-8">
                  <Textarea
                    placeholder="Join the discussion... write a comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    className="mb-3 rounded-xl border-gray-200 focus-visible:ring-[#FF7A45] p-4 text-sm"
                  />
                  <Button 
                    className="bg-[#FF7A45] hover:bg-[#ff8f61] text-white font-semibold rounded-xl h-11 px-6 active:scale-98 transition-transform"
                    onClick={() => commentMutation.mutate(comment)}
                    disabled={!comment.trim() || commentMutation.isPending}
                  >
                    Post Comment
                  </Button>
                </div>
              ) : (
                <Card className="mb-8 bg-gray-50 border border-gray-150 rounded-2xl">
                  <CardContent className="text-center py-6">
                    <p className="text-sm text-[#6B7280]">
                      <Link href="/login" className="text-[#FF7A45] font-semibold hover:underline">Login</Link> to write a comment and join the discussion.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Comments List */}
              <div className="space-y-4">
                {post.comments?.length === 0 ? (
                  <p className="text-[#6B7280] text-center py-10 font-medium text-sm">No comments yet. Be the first to start the conversation!</p>
                ) : (
                  post.comments?.map((comment: any) => (
                    <Card key={comment.id} className="rounded-2xl border-gray-100 bg-[#FAFAFA]">
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <div className="flex flex-wrap items-center gap-2.5 mb-2">
                              <span className="font-semibold text-sm text-[#1F2937]">
                                {comment.user?.profile?.firstName} {comment.user?.profile?.lastName}
                              </span>
                              <span className="text-xs text-[#6B7280] font-medium">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-[#1F2937]/90 leading-relaxed">{comment.content}</p>
                          </div>
                          {(user?.id === comment.userId || user?.roles?.includes('admin')) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold px-2.5 h-8 shrink-0"
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
    </div>
  );
}