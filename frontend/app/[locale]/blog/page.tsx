'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth-provider';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { Calendar, User, Heart, MessageCircle } from 'lucide-react';

export default function BlogPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');

  const { data: postsData, isLoading } = useQuery({
    queryKey: ['blog-posts', search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      params.append('published', 'true');
      params.append('limit', '12');

      const response = await api.get(`/blog/posts?${params.toString()}`);
      return response.data;
    },
  });

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1F2937]">
      <Navbar alwaysWhite={true} />

      <main className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-14 py-12 pt-32">
        {/* Banner */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-[#FF7A45] tracking-wider uppercase mb-2 block">Academy Blog</span>
          <h1 className="text-3xl md:text-4xl lg:text-[48px] font-extrabold tracking-tight text-[#1F2937] mb-4">
            HobbyHub Insights & Stories
          </h1>
          <p className="text-base text-[#6B7280]">
            Expert resources, updates, and inspirational stories from our learning community.
          </p>
        </div>

        {/* Search and Action bar */}
        <div className="flex flex-col sm:flex-row justify-center items-center max-w-lg mx-auto mb-12 gap-3">
          <Input
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 px-4 rounded-xl border-gray-200 focus-visible:ring-[#FF7A45] w-full"
          />
          {user && (
            <Link href="/blog/create" className="w-full sm:w-auto shrink-0">
              <Button className="w-full sm:w-auto h-11 bg-[#FF7A45] hover:bg-[#ff8f61] text-[#1F2937] font-semibold rounded-xl px-6">
                Write Post
              </Button>
            </Link>
          )}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="bg-white rounded-[24px] border border-gray-100 p-6 space-y-4 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-2xl w-full" />
                <div className="h-6 bg-gray-200 rounded-md w-3/4" />
                <div className="h-4 bg-gray-150 rounded w-full" />
                <div className="h-4 bg-gray-150 rounded w-5/6" />
              </div>
            ))}
          </div>
        ) : postsData?.data?.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-[24px] border border-gray-100">
            <p className="text-gray-500 font-medium mb-3">No articles found</p>
            {user && (
              <Link href="/blog/create">
                <Button className="bg-[#FF7A45] hover:bg-[#ff8f61] text-[#1F2937] font-semibold rounded-xl h-11 px-6">
                  Write the first post
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {postsData?.data?.map((post: any) => (
              <Card key={post.id} className="border border-gray-100 bg-white rounded-[24px] hover:translate-y-[-6px] hover:shadow-xl hover:shadow-[#FF7A45]/5 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm">
                <div>
                  {post.imageUrl ? (
                    <div className="relative h-48 w-full bg-gray-100">
                      <Image
                        src={post.imageUrl}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-48 w-full bg-[#FFF2EB] flex items-center justify-center text-4xl font-extrabold text-[#FF7A45]">
                      G
                    </div>
                  )}
                  <CardHeader className="p-6 pb-2">
                    <CardTitle className="text-xl font-bold text-[#1F2937] leading-snug line-clamp-2 hover:text-[#FF7A45] transition-colors">
                      <Link href={`/blog/${post.id}`}>{post.title}</Link>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 text-xs font-semibold text-[#6B7280] pt-1.5">
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        {post.author?.profile?.firstName} {post.author?.profile?.lastName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 pt-2">
                    <p className="text-sm text-[#6B7280] leading-relaxed line-clamp-3">
                      {post.content}
                    </p>
                  </CardContent>
                </div>
                <CardContent className="p-6 pt-0 border-t border-gray-50 flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-4 text-sm text-[#6B7280]">
                    <span className="flex items-center gap-1">
                      <Heart className="h-4 w-4 text-red-400" />
                      {post.likeCount || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4 text-[#FF7A45]" />
                      {post.commentCount || 0}
                    </span>
                  </div>
                  <Link href={`/blog/${post.id}`}>
                    <Button variant="outline" size="sm" className="rounded-xl font-semibold border-gray-200 text-[#1F2937] hover:bg-gray-50 text-xs">
                      Read Article
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {postsData?.pagination?.pages > 1 && (
          <div className="flex justify-center gap-3 mt-12">
            <Button variant="outline" className="rounded-xl" disabled>
              Previous
            </Button>
            <Button variant="outline" className="rounded-xl">
              Next
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}