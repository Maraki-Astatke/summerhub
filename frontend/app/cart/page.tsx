'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth-provider';
import Navbar from '@/components/Navbar';
import api from '../lib/api';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const response = await api.get('/cart');
      return response.data;
    },
    enabled: !!user,
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }: {
      productId: number;
      quantity: number;
    }) => {
      if (quantity === 0) {
        await api.delete(`/cart/remove/${productId}`);
      } else {
        await api.put('/cart/update', { productId, quantity });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (productId: number) => {
      await api.delete(`/cart/remove/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] py-20 text-[#1F2937]">
        <div className="max-w-[1440px] mx-auto px-4 text-center max-w-md">
          <ShoppingBag className="h-14 w-14 mx-auto text-[#FF7A45] mb-4 opacity-80" />
          <h1 className="text-2xl font-bold mb-3">Your Shopping Cart</h1>
          <p className="text-sm text-[#6B7280] mb-6">Please log in to view items in your cart.</p>
          <Link href="/login">
            <Button className="bg-[#FF7A45] hover:bg-[#ff8f61] text-[#1F2937] font-bold h-11 px-8 rounded-xl">
              Login to Account
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center font-semibold text-gray-500">Loading your cart...</div>
      </div>
    );
  }

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] py-20 text-[#1F2937]">
        <div className="max-w-[1440px] mx-auto px-4 text-center max-w-md">
          <ShoppingBag className="h-14 w-14 mx-auto text-[#FF7A45] mb-4 opacity-80" />
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-sm text-[#6B7280] mb-6">
            Looks like you haven't added any project supplies or course books yet.
          </p>
          <Link href="/shops">
            <Button className="bg-[#FF7A45] hover:bg-[#ff8f61] text-[#1F2937] font-bold h-11 px-8 rounded-xl">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1F2937]">
      <Navbar alwaysWhite={true} />

      <main className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-14 py-12 pt-32">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/shops">
            <Button variant="ghost" size="sm" className="text-[#6B7280] hover:text-[#FF7A45] font-semibold rounded-xl">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Shop
            </Button>
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1F2937]">Your Cart</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item: any) => (
              <Card key={item.productId} className="border border-gray-100 bg-white rounded-[24px] shadow-sm overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-1 space-y-1">
                      <h3 className="text-lg font-bold text-[#1F2937]">{item.product.name}</h3>
                      <p className="text-sm text-[#6B7280] leading-relaxed">
                        {item.product.description?.substring(0, 80)}...
                      </p>
                      <p className="text-base font-extrabold text-[#FF7A45] pt-1">
                        {item.product.price} ETB
                      </p>
                    </div>
                    <div className="flex items-center sm:flex-col sm:items-end gap-4 shrink-0 w-full sm:w-auto justify-between border-t sm:border-t-0 pt-4 sm:pt-0">
                      <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl p-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-gray-500 hover:text-[#FF7A45]"
                          onClick={() =>
                            updateQuantityMutation.mutate({
                              productId: item.productId,
                              quantity: item.quantity - 1,
                            })
                          }
                          disabled={updateQuantityMutation.isPending}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </Button>
                        <span className="w-8 text-center text-sm font-bold text-gray-700">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-gray-500 hover:text-[#FF7A45]"
                          onClick={() =>
                            updateQuantityMutation.mutate({
                              productId: item.productId,
                              quantity: item.quantity + 1,
                            })
                          }
                          disabled={updateQuantityMutation.isPending}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600 font-semibold text-xs"
                        onClick={() =>
                          removeItemMutation.mutate(item.productId)
                        }
                        disabled={removeItemMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 mr-1.5" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div>
            <Card className="border border-gray-100 bg-white rounded-[24px] shadow-sm overflow-hidden sticky top-28">
              <CardHeader className="p-6 pb-4 border-b border-gray-50">
                <CardTitle className="text-lg font-bold text-[#1F2937]">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between text-sm font-semibold text-[#6B7280]">
                  <span>Subtotal ({cart.itemCount} items)</span>
                  <span className="text-[#1F2937]">{cart.total} ETB</span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-[#6B7280]">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex justify-between font-extrabold text-lg text-[#1F2937]">
                    <span>Total</span>
                    <span className="text-[#FF7A45]">{cart.total} ETB</span>
                  </div>
                </div>
                <Button
                  className="w-full h-12 bg-[#FF7A45] hover:bg-[#ff8f61] text-[#1F2937] font-bold rounded-xl transition-all mt-4"
                  onClick={() => router.push('/checkout')}
                >
                  Proceed to Checkout
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}