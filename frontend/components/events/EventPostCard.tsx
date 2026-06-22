'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Users, Mail, CheckCircle, Heart, MessageCircle, Send, MoreVertical, Trash2, Edit } from 'lucide-react';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';

interface EventPostCardProps {
  post: any;
  currentUser: any;
  onPostUpdated?: () => void;
  onEdit?: (post: any) => void;
  onDelete?: (id: number) => void;
  isAdminView?: boolean;
}

export default function EventPostCard({ post, currentUser, onPostUpdated, onEdit, onDelete, isAdminView }: EventPostCardProps) {
  const [isLiked, setIsLiked] = useState(post.likes?.some((l: any) => l.userId === currentUser?.id) || false);
  const [likesCount, setLikesCount] = useState(post._count?.likes || post.likes?.length || 0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(post.comments || []);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const isAdmin = currentUser?.roles?.includes('admin');
  const isAuthor = post.authorId === currentUser?.id;

  const handleLike = async () => {
    if (!currentUser) return;
    try {
      const prevLiked = isLiked;
      setIsLiked(!prevLiked);
      setLikesCount((prev: number) => prevLiked ? prev - 1 : prev + 1);
      
      const res = await api.post(`/event-posts/${post.id}/like`);
      setIsLiked(res.data.liked);
      if (onPostUpdated) onPostUpdated();
    } catch (error) {
      console.error('Failed to toggle like:', error);
      // Revert optimistic update
      setIsLiked(isLiked);
      setLikesCount(likesCount);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !currentUser) return;

    setIsSubmittingComment(true);
    try {
      const res = await api.post(`/event-posts/${post.id}/comments`, { content: commentText });
      setComments([res.data, ...comments]);
      setCommentText('');
      if (onPostUpdated) onPostUpdated();
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await api.delete(`/event-posts/${post.id}/comments/${commentId}`);
      setComments(comments.filter((c: any) => c.id !== commentId));
      if (onPostUpdated) onPostUpdated();
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  return (
    <Card className="overflow-hidden border-gray-100 shadow-md hover:shadow-lg transition-all duration-300 rounded-[24px]">
      {post.imageUrl && (
        <div className="w-full h-64 md:h-[400px] overflow-hidden relative">
          <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}
      <CardHeader className="pb-4 relative">
        {(isAdminView || (isAdmin && isAuthor)) && (onEdit || onDelete) && (
          <div className="absolute top-4 right-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(post)}>
                    <Edit className="h-4 w-4 mr-2" /> Edit Post
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem onClick={() => onDelete(post.id)} className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" /> Delete Post
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        <div className="inline-flex items-center gap-2 mb-3">
          <span className="bg-[#FF7A45]/10 text-[#FF7A45] px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
            Talent Event
          </span>
          <span className="text-xs text-gray-500">
            Posted {format(new Date(post.createdAt), 'MMM d, yyyy')}
          </span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 leading-tight pr-8">{post.title}</h2>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Main Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
          <div className="flex items-center gap-3 text-gray-700">
            <div className="bg-white p-2 rounded-lg shadow-sm">
              <Calendar className="w-5 h-5 text-[#FF7A45]" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase">Date</p>
              <p className="font-semibold">{post.date}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <div className="bg-white p-2 rounded-lg shadow-sm">
              <Clock className="w-5 h-5 text-[#FF7A45]" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase">Time</p>
              <p className="font-semibold">{post.time}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-gray-700 md:col-span-2">
            <div className="bg-white p-2 rounded-lg shadow-sm">
              <MapPin className="w-5 h-5 text-[#FF7A45]" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase">Location</p>
              <p className="font-semibold">{post.location}</p>
            </div>
          </div>
        </div>

        {/* Content Blocks */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A45]"></span> About
            </h3>
            <p className="text-gray-600 whitespace-pre-wrap text-sm leading-relaxed">{post.about}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" /> Who Can Join
              </h3>
              <p className="text-gray-600 text-sm">{post.whoCanJoin}</p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-gray-500" /> How to Register
              </h3>
              <p className="text-gray-600 text-sm">{post.howToRegister}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-500" /> Contact
            </h3>
            <p className="text-gray-600 text-sm">{post.contact}</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col border-t bg-gray-50/50 p-4">
        {/* Interaction Bar */}
        <div className="flex items-center justify-between w-full">
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLike}
              className={`rounded-full gap-2 ${isLiked ? 'text-red-500 hover:text-red-600 hover:bg-red-50' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span className="font-medium">{likesCount}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowComments(!showComments)}
              className="rounded-full gap-2 text-gray-500 hover:text-gray-900"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="font-medium">{post._count?.comments || comments.length || 0}</span>
            </Button>
          </div>
          <div className="text-xs text-gray-400 font-medium">
            By {post.author?.profile?.firstName || 'Admin'} {post.author?.profile?.lastName || ''}
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="w-full mt-4 space-y-4 pt-4 border-t border-gray-100">
            {currentUser ? (
              <form onSubmit={handleAddComment} className="flex gap-2">
                <div className="flex-1 relative">
                  <Input 
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..." 
                    className="rounded-full bg-white pr-10"
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    variant="ghost" 
                    disabled={isSubmittingComment || !commentText.trim()}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full text-[#FF7A45] hover:text-[#ff6224] hover:bg-[#FF7A45]/10"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            ) : (
              <p className="text-xs text-center text-gray-500">Log in to comment and like.</p>
            )}

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {comments.map((comment: any) => (
                <div key={comment.id} className="flex gap-3 group">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF7A45] to-[#ff6224] flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {(comment.user?.profile?.firstName?.[0] || comment.user?.email?.[0] || 'U').toUpperCase()}
                  </div>
                  <div className="flex-1 bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-50 relative">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-sm font-semibold text-gray-900">
                        {comment.user?.profile?.firstName || 'User'} {comment.user?.profile?.lastName || ''}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {format(new Date(comment.createdAt), 'MMM d')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{comment.content}</p>
                    
                    {/* Delete Comment Button */}
                    {(isAdmin || comment.userId === currentUser?.id) && (
                      <button 
                        onClick={() => handleDeleteComment(comment.id)}
                        className="absolute -right-2 -top-2 bg-white rounded-full p-1.5 shadow-sm border border-gray-100 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-sm text-center text-gray-500 py-4">No comments yet. Be the first!</p>
              )}
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
