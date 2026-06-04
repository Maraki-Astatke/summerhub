'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
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
    <div className="min-h-screen bg-[#FAFAFA] text-[#1F2937]">
      <Navbar alwaysWhite={true} />

      <main className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-14 py-12 pt-32">
        <div className="mb-10">
          <span className="text-xs font-bold text-[#FF7A45] tracking-wider uppercase mb-2 block">Catalog Explorer</span>
          <h1 className="text-3xl md:text-4xl lg:text-[48px] font-extrabold tracking-tight text-[#1F2937] mb-3">
            Explore Learning Tracks
          </h1>
          <p className="text-base text-[#6B7280]">Discover courses and activities that match your future goals</p>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 px-4 rounded-xl border-gray-200 focus-visible:ring-[#FF7A45]"
            />
            
            <select 
              className="h-11 border border-gray-200 rounded-xl px-4 py-2 text-sm text-[#1F2937] bg-white focus:outline-none focus:ring-2 focus:ring-[#FF7A45] focus:border-transparent transition-all"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories?.map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            <select 
              className="h-11 border border-gray-200 rounded-xl px-4 py-2 text-sm text-[#1F2937] bg-white focus:outline-none focus:ring-2 focus:ring-[#FF7A45] focus:border-transparent transition-all"
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
              className="h-11 rounded-xl border-gray-200 hover:bg-gray-50 text-sm font-semibold text-gray-700 active:scale-98 transition-transform duration-100"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="bg-white rounded-[24px] border border-gray-100 p-6 space-y-4 animate-pulse">
                <div className="h-6 bg-gray-200 rounded-md w-2/3" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-150 rounded w-full" />
                  <div className="h-4 bg-gray-150 rounded w-5/6" />
                </div>
                <div className="h-4 bg-gray-200 rounded w-1/3 pt-4" />
                <div className="h-10 bg-gray-200 rounded-xl w-full" />
              </div>
            ))}
          </div>
        ) : hobbiesData?.data?.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-[24px] border border-gray-100">
            <p className="text-gray-500 font-medium mb-3">No learning tracks found matching filters</p>
            <Button 
              variant="link" 
              className="text-[#FF7A45] font-semibold hover:underline"
              onClick={() => {
                setSearch('');
                setCategory('');
                setAgeGroup('');
              }}
            >
              Clear all filters
            </Button>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {hobbiesData?.data?.map((hobby: any) => (
                <Card key={hobby.id} className="border border-gray-100 bg-white rounded-[24px] hover:translate-y-[-6px] hover:shadow-xl hover:shadow-[#FF7A45]/5 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm">
                  <CardHeader className="p-6 pb-2">
                    <CardTitle className="text-xl font-bold text-[#1F2937] leading-snug tracking-tight mb-2">
                      {hobby.name}
                    </CardTitle>
                    <CardDescription className="text-sm text-[#6B7280] leading-relaxed">
                      {hobby.description?.substring(0, 95)}...
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 pt-0 space-y-4">
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-xs font-semibold">
                      <span className="text-[#6B7280] bg-gray-100 px-2.5 py-1 rounded-lg">
                        {hobby.ageGroup} years
                      </span>
                      {hobby.category && (
                        <span className="text-[#FF7A45] bg-[#FFF2EB] px-2.5 py-1 rounded-lg">
                          {hobby.category.name}
                        </span>
                      )}
                    </div>
                    <Link href={`/hobbies/${hobby.id}`} className="block">
                      <Button className="w-full h-11 bg-[#FF7A45] hover:bg-[#ff8f61] text-white font-semibold rounded-xl transition-all duration-200">
                        Explore track
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {hobbiesData?.pagination?.pages > 1 && (
              <div className="flex justify-center gap-3 mt-12">
                <Button variant="outline" className="rounded-xl" disabled>Previous</Button>
                <Button variant="outline" className="rounded-xl">Next</Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}