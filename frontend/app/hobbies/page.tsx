'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export default function HobbiesPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [ageGroup, setAgeGroup] = useState('');

  const { data: hobbiesData, isLoading } = useQuery({
    queryKey: ['hobbies', search, category, ageGroup],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('categoryId', category);
      if (ageGroup) params.append('ageGroup', ageGroup);
      params.append('limit', '12');
      
      const response = await api.get(`/hobbies?${params.toString()}`);
      return response.data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/categories');
      return response.data;
    },
  });

  const ageGroups = ['6-9', '10-13', '14-18'];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-xl font-bold text-purple-600">HobbyHub</Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Explore Hobbies</h1>
        <p className="text-gray-600 mb-8">Discover activities that match your interests</p>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            <Input
              placeholder="Search hobbies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            
            <select 
              className="border rounded-md px-3 py-2"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories?.map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            <select 
              className="border rounded-md px-3 py-2"
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value)}
            >
              <option value="">All Ages</option>
              {ageGroups.map(age => (
                <option key={age} value={age}>{age} years</option>
              ))}
            </select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearch('');
                setCategory('');
                setAgeGroup('');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="text-center py-12">Loading...</div>
        ) : hobbiesData?.data?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No hobbies found</p>
            <Button variant="link" onClick={() => {
              setSearch('');
              setCategory('');
              setAgeGroup('');
            }}>Clear filters</Button>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {hobbiesData?.data?.map((hobby: any) => (
                <Card key={hobby.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>{hobby.name}</CardTitle>
                    <CardDescription>{hobby.description?.substring(0, 100)}...</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-500">{hobby.ageGroup} years</span>
                      {hobby.category && (
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {hobby.category.name}
                        </span>
                      )}
                    </div>
                    <Link href={`/hobbies/${hobby.id}`}>
                      <Button className="w-full">Explore</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {hobbiesData?.pagination?.pages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button variant="outline" disabled>Previous</Button>
                <Button variant="outline">Next</Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}