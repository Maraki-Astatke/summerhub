'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import EventPostForm from '@/components/events/EventPostForm';
import EventPostCard from '@/components/events/EventPostCard';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function AdminEventPostsPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/event-posts');
      setPosts(res.data);
    } catch (error) {
      console.error('Failed to fetch event posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPost(null);
    setIsModalOpen(true);
  };

  const handleEdit = (post: any) => {
    setEditingPost(post);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this event post?')) {
      try {
        await api.delete(`/admin/event-posts/${id}`);
        setPosts(posts.filter(p => p.id !== id));
      } catch (error) {
        console.error('Failed to delete post:', error);
      }
    }
  };

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      if (editingPost) {
        await api.put(`/admin/event-posts/${editingPost.id}`, formData);
      } else {
        await api.post('/admin/event-posts', formData);
      }
      setIsModalOpen(false);
      fetchPosts();
    } catch (error) {
      console.error('Failed to save post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading history...</div>;
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[24px] shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Talent Events</h1>
          <p className="text-gray-500 mt-1">Create and manage your monthly talent event announcements.</p>
        </div>
        <Button onClick={handleCreate} className="bg-[#FF7A45] hover:bg-[#ff6224] text-white rounded-full px-6 shadow-md shadow-[#FF7A45]/20">
          <Plus className="w-5 h-5 mr-2" /> Create Event Post
        </Button>
      </div>

      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[24px] border border-gray-100 shadow-sm">
            <div className="w-16 h-16 bg-[#FF7A45]/10 text-[#FF7A45] rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Event Posts Yet</h2>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">You haven't created any talent event posts. Create your first one to notify students and scholars.</p>
            <Button onClick={handleCreate} className="bg-[#FF7A45] hover:bg-[#ff6224] text-white rounded-full px-8">
              Create First Post
            </Button>
          </div>
        ) : (
          <div className="grid gap-8">
            <h2 className="text-xl font-bold text-gray-900 px-2">Your Post History ({posts.length})</h2>
            {posts.map(post => (
              <EventPostCard
                key={post.id}
                post={post}
                currentUser={user}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isAdminView={true}
              />
            ))}
          </div>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {editingPost ? 'Edit Event Post' : 'Create Talent Event Post'}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-6">
            <EventPostForm
              initialData={editingPost}
              onSubmit={handleSubmit}
              onCancel={() => setIsModalOpen(false)}
              isLoading={isSubmitting}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
