"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import api from "../lib/api";
import { Calendar, User, Heart, MessageCircle } from "lucide-react";

export default function BlogPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");

  const { data: postsData, isLoading } = useQuery({
    queryKey: ["blog-posts", search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      params.append("published", "true");
      params.append("limit", "12");

      const response = await api.get(`/blog/posts?${params.toString()}`);
      return response.data;
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-purple-600">
            HobbyHub
          </Link>
          <div className="flex gap-4">
            <Link href="/hobbies">
              <Button variant="ghost">Hobbies</Button>
            </Link>
            <Link href="/lessons">
              <Button variant="ghost">Lessons</Button>
            </Link>
            <Link href="/shops">
              <Button variant="ghost">Shop</Button>
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

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">HobbyHub Blog</h1>
          <p className="text-gray-600">
            Stories, tips, and inspiration from our community
          </p>
        </div>

        {/* Search and Create Post */}
        <div className="flex justify-between items-center max-w-md mx-auto mb-8 gap-4">
          <Input
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          {user && (
            <Link href="/blog/create">
              <Button>Write Post</Button>
            </Link>
          )}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="text-center py-12">Loading...</div>
        ) : postsData?.data?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No blog posts found</p>
            {user && (
              <Link href="/blog/create">
                <Button className="mt-4">Write First Post</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {postsData?.data?.map((post: any) => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow">
                {post.imageUrl && (
                  <div className="relative h-48 w-full">
                    <Image
                      src={post.imageUrl}
                      alt={post.title}
                      fill
                      className="object-cover rounded-t-lg"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                  <CardDescription className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {post.author?.profile?.firstName}{" "}
                      {post.author?.profile?.lastName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 line-clamp-3 mb-4">
                    {post.content.substring(0, 150)}...
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {post.likeCount || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        {post.commentCount || 0}
                      </span>
                    </div>
                    <Link href={`/blog/${post.id}`}>
                      <Button variant="outline" size="sm">
                        Read More
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {postsData?.pagination?.pages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <Button variant="outline" disabled>
              Previous
            </Button>
            <Button variant="outline">Next</Button>
          </div>
        )}
      </main>
    </div>
  );
}