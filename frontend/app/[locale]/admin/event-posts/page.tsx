'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Plus, Users, FileText, Download, Trash2, 
  ChevronDown, ChevronRight, Mail, Phone, User
} from 'lucide-react';
import EventPostForm from '@/components/events/EventPostForm';
import EventPostCard from '@/components/events/EventPostCard';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { format } from 'date-fns';

export default function AdminEventPostsPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedRegistrations, setExpandedRegistrations] = useState<Record<number, any[]>>({});
  const [loadingRegs, setLoadingRegs] = useState<Record<number, boolean>>({});
  const [openRegPanel, setOpenRegPanel] = useState<number | null>(null);

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

  const fetchRegistrations = async (postId: number) => {
    if (openRegPanel === postId) {
      setOpenRegPanel(null);
      return;
    }
    setOpenRegPanel(postId);
    if (expandedRegistrations[postId]) return; // already loaded
    setLoadingRegs(prev => ({ ...prev, [postId]: true }));
    try {
      const res = await api.get(`/admin/event-posts/${postId}/registrations`);
      setExpandedRegistrations(prev => ({ ...prev, [postId]: res.data }));
    } catch (error) {
      console.error('Failed to fetch registrations:', error);
    } finally {
      setLoadingRegs(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleDeleteRegistration = async (postId: number, regId: number) => {
    if (!confirm('Remove this registration?')) return;
    try {
      await api.delete(`/admin/event-posts/registrations/${regId}`);
      setExpandedRegistrations(prev => ({
        ...prev,
        [postId]: prev[postId].filter((r: any) => r.id !== regId)
      }));
    } catch (error) {
      console.error('Failed to delete registration:', error);
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
          <p className="text-gray-500 mt-1">Create, manage posts, and view student registrations.</p>
        </div>
        <Button onClick={handleCreate} className="bg-[#FF7A45] hover:bg-[#ff6224] text-white rounded-full px-6 shadow-md shadow-[#FF7A45]/20">
          <Plus className="w-5 h-5 mr-2" /> Create Event Post
        </Button>
      </div>

      <div className="space-y-10">
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
          <div className="space-y-10">
            <h2 className="text-xl font-bold text-gray-900 px-2">Your Post History ({posts.length})</h2>
            {posts.map(post => (
              <div key={post.id} className="space-y-3">
                <EventPostCard
                  post={post}
                  currentUser={user}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isAdminView={true}
                />

                {/* Registrations Panel */}
                <button
                  onClick={() => fetchRegistrations(post.id)}
                  className="flex items-center gap-2 w-full px-5 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-[#FF7A45]/30 hover:bg-[#FFF8F5] transition-all text-sm font-semibold text-gray-700 group"
                >
                  {openRegPanel === post.id 
                    ? <ChevronDown className="w-4 h-4 text-[#FF7A45]" />
                    : <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#FF7A45] transition-colors" />
                  }
                  <Users className="w-4 h-4 text-gray-400" />
                  View Registrations
                  {expandedRegistrations[post.id] && (
                    <span className="ml-auto bg-[#FF7A45]/10 text-[#FF7A45] text-xs font-bold px-2 py-0.5 rounded-full">
                      {expandedRegistrations[post.id].length}
                    </span>
                  )}
                </button>

                {openRegPanel === post.id && (
                  <Card className="rounded-[20px] border-gray-100 shadow-sm">
                    <CardContent className="p-5">
                      {loadingRegs[post.id] ? (
                        <p className="text-sm text-gray-500 text-center py-4">Loading registrations...</p>
                      ) : !expandedRegistrations[post.id] || expandedRegistrations[post.id].length === 0 ? (
                        <div className="text-center py-8">
                          <Users className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">No registrations yet for this event.</p>
                          <p className="text-xs text-gray-400 mt-1">Make sure registration is open so students can apply.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider pb-2 border-b">
                            {expandedRegistrations[post.id].length} Registration(s)
                          </p>
                          {expandedRegistrations[post.id].map((reg: any) => (
                            <div key={reg.id} className="flex items-start justify-between gap-4 p-4 bg-gray-50 rounded-xl hover:bg-[#FFF8F5] transition-colors group">
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF7A45] to-[#ff6224] flex items-center justify-center text-white text-sm font-bold shrink-0">
                                  {reg.name[0].toUpperCase()}
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <User className="w-3.5 h-3.5 text-gray-400" />
                                    <span className="font-semibold text-sm text-gray-900">{reg.name}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Mail className="w-3.5 h-3.5" />
                                    <a href={`mailto:${reg.email}`} className="hover:text-[#FF7A45] transition-colors">{reg.email}</a>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Phone className="w-3.5 h-3.5" />
                                    <span>{reg.phone}</span>
                                  </div>
                                  {reg.fileUrl && (
                                    <a
                                      href={reg.fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 text-xs text-[#FF7A45] font-semibold hover:underline mt-1"
                                    >
                                      <FileText className="w-3.5 h-3.5" />
                                      {reg.fileName || 'View Uploaded File'}
                                    </a>
                                  )}
                                  <p className="text-[10px] text-gray-400">
                                    Registered {format(new Date(reg.createdAt), 'MMM d, yyyy • h:mm a')}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteRegistration(post.id, reg.id)}
                                className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all p-1.5 rounded-lg hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[1200px] w-[95vw] max-h-[90vh] overflow-y-auto">
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
