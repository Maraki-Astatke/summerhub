'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth-provider';
import { useTranslations } from 'next-intl';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { ShoppingCart, Star, Package, Phone } from 'lucide-react';

export default function ShopPage() {
  const { user } = useAuth();
  const t = useTranslations();
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
      alert(t('shop.addedToCart'));
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || t('shop.addToCartFailed'));
    },
  });

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1F2937]">
      <Navbar alwaysWhite={true} />

      <main className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-14 py-12 pt-32">
        <div className="mb-10">
          <span className="text-xs font-bold text-[#FF7A45] tracking-wider uppercase mb-2 block">
            {t('shop.marketplace')}
          </span>
          <h1 className="text-3xl md:text-4xl lg:text-[48px] font-extrabold tracking-tight text-[#1F2937] mb-3">
            {t('shop.title')}
          </h1>
          <p className="text-base text-[#6B7280]">
            {t('shop.subtitle')}
          </p>
        </div>

        {}
        <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <Input
              placeholder={t('shop.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 px-4 rounded-xl border-gray-200 focus-visible:ring-[#FF7A45]"
            />
            
            <select 
              className="h-11 border border-gray-200 rounded-xl px-4 py-2 text-sm text-[#1F2937] bg-white focus:outline-none focus:ring-2 focus:ring-[#FF7A45] focus:border-transparent transition-all"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">{t('shop.allCategories')}</option>
              {categories?.map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            <Input
              placeholder={t('shop.minPrice')}
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="h-11 px-4 rounded-xl border-gray-200 focus-visible:ring-[#FF7A45]"
            />

            <Input
              placeholder={t('shop.maxPrice')}
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="h-11 px-4 rounded-xl border-gray-200 focus-visible:ring-[#FF7A45]"
            />

            <Button 
              variant="outline" 
              className="h-11 rounded-xl border-gray-200 hover:bg-gray-50 text-sm font-semibold text-gray-700 active:scale-98 transition-transform"
              onClick={() => {
                setSearch('');
                setCategory('');
                setMinPrice('');
                setMaxPrice('');
              }}
            >
              {t('shop.clearFilters')}
            </Button>
          </div>
        </div>

        {}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, idx) => (
              <div key={idx} className="bg-white rounded-[24px] border border-gray-100 overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200 w-full" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-150 rounded w-full" />
                  <div className="h-4 bg-gray-150 rounded w-2/3" />
                  <div className="h-10 bg-gray-200 rounded-xl w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : productsData?.data?.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-[24px] border border-gray-100 shadow-sm">
            <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium mb-3">{t('shop.noProducts')}</p>
            <Button 
              variant="link" 
              className="text-[#FF7A45] font-semibold hover:underline"
              onClick={() => {
                setSearch('');
                setCategory('');
                setMinPrice('');
                setMaxPrice('');
              }}
            >
              {t('shop.clearAllFilters')}
            </Button>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {productsData?.data?.map((product: any) => (
                <Card key={product.id} className="border border-gray-100 bg-white rounded-[24px] hover:translate-y-[-6px] hover:shadow-xl hover:shadow-[#FF7A45]/5 transition-all duration-300 flex flex-col overflow-hidden shadow-sm">
                  {}
                  <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).parentElement!.innerHTML = `
                            <div class="w-full h-full flex items-center justify-center bg-gray-100">
                              <svg class="h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          `;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <Package className="h-16 w-16 text-gray-300" />
                      </div>
                    )}
                    
                    {}
                    {product.stockCount < 10 && product.stockCount > 0 && (
                      <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                        Low Stock
                      </div>
                    )}
                    {product.stockCount === 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-bold text-lg px-4 py-2 bg-red-500 rounded-full">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>

                  {}
                  <div className="p-4 flex flex-col flex-1">
                    <CardTitle className="text-lg font-bold text-[#1F2937] leading-snug tracking-tight mb-1 line-clamp-1">
                      {product.name}
                    </CardTitle>
                    <CardDescription className="text-sm text-[#6B7280] leading-relaxed line-clamp-2 flex-1">
                      {product.description || 'No description available'}
                    </CardDescription>
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <span className="text-xl font-extrabold text-[#FF7A45]">
                        {product.price} ETB
                      </span>
                      {product.stockCount > 0 ? (
                        <span className="text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-lg">
                          In Stock
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg">
                          Out of Stock
                        </span>
                      )}
                    </div>
                    
                    {}
                    {product.phone && (
                      <div className="flex items-center gap-2 mt-2 text-sm">
                        <Phone className="h-4 w-4 text-[#FF7A45]" />
                        <span className="text-gray-600 font-medium">{product.phone}</span>
                      </div>
                    )}
                    
                    {}
                    {product.reviews && product.reviews.length > 0 && (
                      <div className="flex items-center gap-1 mt-2">
                        {[...Array(5)].map((_, i) => {
                          const avgRating = product.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / product.reviews.length;
                          return (
                            <Star key={i} className={`h-4 w-4 ${i < Math.floor(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                          );
                        })}
                        <span className="text-xs text-gray-500 font-semibold ml-1">
                          ({product.reviews.length})
                        </span>
                      </div>
                    )}
                    
                    <Button 
                      className="w-full h-11 mt-4 bg-[#FF7A45] hover:bg-[#ff8f61] text-[#1F2937] font-semibold rounded-xl transition-all duration-200"
                      onClick={() => addToCartMutation.mutate({ productId: product.id, quantity: 1 })}
                      disabled={product.stockCount === 0 || addToCartMutation.isPending}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {addToCartMutation.isPending ? 'Adding...' : t('shop.addToCart')}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {}
            {productsData?.pagination?.pages > 1 && (
              <div className="flex justify-center gap-3 mt-12">
                <Button variant="outline" className="rounded-xl" disabled>
                  {t('shop.previous')}
                </Button>
                <Button variant="outline" className="rounded-xl">
                  {t('shop.next')}
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
