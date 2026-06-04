'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth-provider';
import api from '../lib/api';
import { ShoppingCart, Star } from 'lucide-react';

export default function ShopPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', search, category, minPrice, maxPrice],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('categoryId', category);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      params.append('limit', '20');
      
      const response = await api.get(`/products?${params.toString()}`);
      return response.data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['product-categories'],
    queryFn: async () => {
      const response = await api.get('/product-categories');
      return response.data;
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: number; quantity: number }) => {
      const response = await api.post('/cart/add', { productId, quantity });
      return response.data;
    },
    onSuccess: () => {
      alert('Added to cart!');
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Failed to add to cart');
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-purple-600">HobbyHub</Link>
          <div className="flex gap-4 items-center">
            <Link href="/cart">
              <Button variant="ghost" className="relative">
                <ShoppingCart className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/hobbies">
              <Button variant="ghost">Hobbies</Button>
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
        <h1 className="text-3xl font-bold mb-2">Marketplace</h1>
        <p className="text-gray-600 mb-8">Shop for hobby supplies and equipment</p>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
          <div className="grid md:grid-cols-5 gap-4">
            <Input
              placeholder="Search products..."
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

            <Input
              placeholder="Min Price"
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />

            <Input
              placeholder="Max Price"
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />

            <Button 
              variant="outline" 
              onClick={() => {
                setSearch('');
                setCategory('');
                setMinPrice('');
                setMaxPrice('');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="text-center py-12">Loading...</div>
        ) : productsData?.data?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No products found</p>
            <Button variant="link" onClick={() => {
              setSearch('');
              setCategory('');
              setMinPrice('');
              setMaxPrice('');
            }}>Clear filters</Button>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {productsData?.data?.map((product: any) => (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>{product.name}</CardTitle>
                    <CardDescription>{product.description?.substring(0, 80)}...</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <span className="text-2xl font-bold text-purple-600">
                        {product.price} ETB
                      </span>
                      {product.stockCount > 0 ? (
                        <span className="ml-2 text-sm text-green-600">In Stock</span>
                      ) : (
                        <span className="ml-2 text-sm text-red-600">Out of Stock</span>
                      )}
                    </div>
                    
                    {product.reviews && product.reviews.length > 0 && (
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / product.reviews.length) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        ))}
                        <span className="text-sm text-gray-500 ml-1">
                          ({product.reviews.length})
                        </span>
                      </div>
                    )}
                    
                    <Button 
                      className="w-full"
                      onClick={() => addToCartMutation.mutate({ productId: product.id, quantity: 1 })}
                      disabled={product.stockCount === 0}
                    >
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {productsData?.pagination?.pages > 1 && (
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