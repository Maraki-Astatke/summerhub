'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import api from '@/lib/api';
import EventPostCard from '@/components/events/EventPostCard';
import { Sparkles } from 'lucide-react';

export default function TalentEventsPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/event-posts');
      setPosts(res.data);
    } catch (error) {
      console.error('Failed to fetch event posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF7A45]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-12">
      <div className="max-w-5xl mx-auto px-6 space-y-12">
        {}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-[#FF7A45]/10 rounded-full mb-2">
            <Sparkles className="w-8 h-8 text-[#FF7A45]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            Monthly Talent Events
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover upcoming talent showcases, competitions, and special events. Join the community, show your support, and share your thoughts!
          </p>
        </div>

        {}
        <div className="space-y-8">
          {posts.length === 0 ? (
            <div className="bg-white p-12 rounded-[32px] text-center border border-gray-100 shadow-sm">
              <div className="text-gray-400 mb-4 flex justify-center">
                <Sparkles className="w-12 h-12 opacity-50" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Events Announced Yet</h3>
              <p className="text-gray-500">Check back later for exciting new talent events!</p>
            </div>
          ) : (
            posts.map(post => (
              <EventPostCard 
                key={post.id} 
                post={post} 
                currentUser={user} 
                onPostUpdated={fetchPosts}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

